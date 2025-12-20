import type { PlatformOAuthAdapter } from "@/core/application/interfaces/social/platform-oauth-adapter";

/**
 * Facebook OAuth required config
 */
export interface FacebookOAuthConfig {
    appId: string;
    appSecret: string;
    redirectUri: string;
}

/**
 * Facebook OAuth Adapter
 * Stateless — follows PlatformOAuthAdapter spec
 */
export class FacebookOAuthAdapter implements PlatformOAuthAdapter {
    private readonly graphApiUrl = "https://graph.facebook.com/v23.0";
    private readonly oauthDialogUrl = "https://www.facebook.com/v23.0/dialog/oauth";

    constructor(private readonly cfg: FacebookOAuthConfig) { }

    /**
     * Build authorization URL for OAuth redirect
     */
    getAuthorizationUrl(state?: string): string {
        const params = new URLSearchParams({
            client_id: this.cfg.appId,
            redirect_uri: this.cfg.redirectUri,
            response_type: "code",
            scope: [
                "pages_show_list",
                "pages_read_engagement",
                "pages_manage_posts",
                "pages_manage_metadata",
                "read_insights",
                "pages_read_user_content"
            ].join(","),
        });

        if (state) params.set("state", state);

        return `${this.oauthDialogUrl}?${params.toString()}`;
    }

    /**
     * Exchange OAuth code → long-lived user token + pages
     * Implements 3-step process like callback route
     */
    async exchangeCodeForToken(code: string) {
        // Step 1: Exchange code for short-lived token
        const params = new URLSearchParams({
            client_id: this.cfg.appId,
            client_secret: this.cfg.appSecret,
            redirect_uri: this.cfg.redirectUri,
            code,
        });

        const response = await fetch(
            `${this.graphApiUrl}/oauth/access_token?${params.toString()}`
        );

        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.error?.message || "Failed to exchange Facebook code");
        }

        // Step 2: Exchange for long-lived user token
        const longLivedParams = new URLSearchParams({
            grant_type: "fb_exchange_token",
            client_id: this.cfg.appId,
            client_secret: this.cfg.appSecret,
            fb_exchange_token: data.access_token,
        });

        const longLivedResponse = await fetch(
            `${this.graphApiUrl}/oauth/access_token?${longLivedParams.toString()}`
        );

        const longLivedData = await longLivedResponse.json();

        if (!longLivedResponse.ok || longLivedData.error) {
            throw new Error(longLivedData.error?.message || "Failed to get long-lived token");
        }

        // Step 3: Get user's pages with page access tokens
        const pagesResponse = await fetch(
            `${this.graphApiUrl}/me/accounts?access_token=${longLivedData.access_token}`
        );

        const pagesData = await pagesResponse.json();

        if (!pagesResponse.ok || pagesData.error) {
            throw new Error(pagesData.error?.message || "Failed to fetch user pages");
        }

        if (!pagesData.data || pagesData.data.length === 0) {
            throw new Error("No Facebook Pages found for this account");
        }

        return {
            accessToken: longLivedData.access_token,
            refreshToken: undefined, // FB does not return refresh token
            expiresIn: longLivedData.expires_in ?? 60 * 60 * 24 * 60, // 60 days
            providerAccountId: pagesData.data[0]?.id || "", // Use first page ID as account ID
            raw: {
                ...longLivedData,
                pages: pagesData.data
            },
        };
    }

    /**
     * Refresh long-lived Facebook token
     * Facebook refreshes by exchanging short-lived token again
     */
    async refreshToken(refreshToken: string) {
        const params = new URLSearchParams({
            grant_type: "fb_exchange_token",
            client_id: this.cfg.appId,
            client_secret: this.cfg.appSecret,
            fb_exchange_token: refreshToken,
        });

        const response = await fetch(
            `${this.graphApiUrl}/oauth/access_token?${params.toString()}`
        );

        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.error?.message || "Failed to refresh Facebook token");
        }

        return {
            accessToken: data.access_token,
            refreshToken: undefined, // FB does not provide
            expiresIn: data.expires_in ?? 5184000, // 60 days
            raw: data,
        };
    }

    /**
     * Verify if an access token is valid
     */
    async verifyAccessToken(accessToken: string): Promise<boolean> {
        const params = new URLSearchParams({ access_token: accessToken });

        const response = await fetch(`${this.graphApiUrl}/me?${params.toString()}`);
        const data = await response.json();

        if (data.error) return false;
        return true;
    }

    /**
     * Retrieve a page access token (must be done after connecting)
     */
    async getPageAccessToken(accessToken: string, pageId: string): Promise<string> {
        const params = new URLSearchParams({
            fields: "access_token",
            access_token: accessToken,
        });

        const response = await fetch(
            `${this.graphApiUrl}/${pageId}?${params.toString()}`
        );

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        return data.access_token;
    }

    /**
     * Optional revoke
     */
    async revokeToken(accessToken: string): Promise<boolean> {
        const params = new URLSearchParams({ access_token: accessToken });

        const response = await fetch(
            `${this.graphApiUrl}/me/permissions?${params.toString()}`,
            { method: "DELETE" }
        );

        const data = await response.json();

        return !!data.success;
    }
}
