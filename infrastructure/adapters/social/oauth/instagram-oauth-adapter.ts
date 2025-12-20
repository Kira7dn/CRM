import type { PlatformOAuthAdapter } from "@/core/application/interfaces/social/platform-oauth-adapter";

export interface InstagramOAuthConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
}

export interface InstagramPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
  };
  is_basic_instagram?: boolean;
}

/**
 * Instagram OAuth + API Adapter (stateless)
 * - Không giữ token
 * - Không cache
 * - Tất cả token được truyền từ UseCase
 * - Implement chuẩn PlatformOAuthAdapter
 */
export class InstagramOAuthAdapter implements PlatformOAuthAdapter {
  private readonly baseUrl = "https://graph.facebook.com/v23.0";

  constructor(private readonly config: InstagramOAuthConfig) { }

  /** Instagram Business Login */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.appId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      scope: [
        "instagram_business_basic",
        "instagram_business_manage_messages",
        "instagram_business_manage_comments",
        "instagram_business_content_publish",
      ].join(","),
    });

    if (state) params.set("state", state);

    return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
  }

  /** Step 1 — exchange code → short-lived token → long-lived token */
  async exchangeCodeForToken(code: string) {
    if (!this.config.appId || !this.config.appSecret) {
      throw new Error("Instagram configuration missing");
    }

    // Step 1: Exchange code for short-lived token (Instagram API)
    const tokenFormData = new FormData();
    tokenFormData.set("client_id", this.config.appId);
    tokenFormData.set("client_secret", this.config.appSecret);
    tokenFormData.set("grant_type", "authorization_code");
    tokenFormData.set("redirect_uri", this.config.redirectUri);
    tokenFormData.set("code", code);

    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      body: tokenFormData
    });
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error_type) {
      throw new Error(tokenData.error_message || "Token exchange failed");
    }

    const shortLivedToken = tokenData.access_token;
    const userId = tokenData.user_id;
    const grantedScopes = tokenData.permissions;

    // Step 2: Exchange short-lived token for long-lived token (GET method with query params)
    const longLivedURL = new URL("https://graph.instagram.com/access_token");
    longLivedURL.searchParams.set("grant_type", "ig_exchange_token");
    longLivedURL.searchParams.set("client_id", this.config.appId);
    longLivedURL.searchParams.set("client_secret", this.config.appSecret);
    longLivedURL.searchParams.set("access_token", shortLivedToken);

    const longLivedRes = await fetch(longLivedURL.toString());
    const longLivedData = await longLivedRes.json();

    if (!longLivedRes.ok || longLivedData.error_type) {
      throw new Error(longLivedData.error_message || "Long-lived token exchange failed");
    }

    const longLivedToken = longLivedData.access_token;

    // Step 3: Get Instagram Business Account info
    const igBusinessURL = `https://graph.instagram.com/v24.0/me?fields=id,username,account_type,media_count&access_token=${longLivedToken}`;
    const igBusinessRes = await fetch(igBusinessURL);
    const igBusinessData = await igBusinessRes.json();

    const igPage: InstagramPage = {
      id: igBusinessData.id,
      name: `@${igBusinessData.username} (${igBusinessData.account_type})`,
      access_token: longLivedToken,
      instagram_business_account: { id: igBusinessData.id },
      is_basic_instagram: igBusinessData.account_type !== 'BUSINESS'
    };
    const igBusinessId = igBusinessData.id;
    const igAccessToken = igPage.access_token;

    // Step 4: Subscribe Webhook fields (only for business accounts)
    if (!igPage.is_basic_instagram) {
      try {
        // Use /me/subscribed_apps endpoint with Instagram API v24.0
        const subscribeURL = `https://graph.instagram.com/v24.0/me/subscribed_apps?subscribed_fields=comments,messages&access_token=${longLivedToken}`;
        const subscribeRes = await fetch(subscribeURL, { method: "POST" });
        const subscribeData = await subscribeRes.json();
        if (!subscribeData.success) {
          console.warn("Failed to subscribe webhook:", subscribeData);
        }
      } catch (err) {
        console.error("Error subscribing Instagram webhook:", err);
      }
    }

    return {
      accessToken: igAccessToken,
      refreshToken: longLivedToken,
      providerAccountId: igBusinessId,
      expiresIn: longLivedData.expires_in || 5184000,
      scope: grantedScopes,
      raw: {
        user_token: longLivedToken,
        page: igPage,
        instagram_business_account_id: igPage.instagram_business_account?.id,
        hasInstagramBusiness: !igPage.is_basic_instagram,
        user_id: userId
      }
    };
  }

  /** Instagram refresh mechanism */
  async refreshToken(accessToken: string) {
    const refreshURL = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`;
    const res = await fetch(refreshURL);
    const raw = await res.json();

    if (!res.ok || raw.error_type) throw new Error(raw.error_message || "Token refresh failed");

    return {
      accessToken: raw.access_token,
      refreshToken: raw.access_token,
      expiresIn: raw.expires_in ?? 5184000,
      raw,
    };
  }

  /** verify token validity */
  async verifyAccessToken(
    accessToken: string,
    igBusinessId?: string
  ): Promise<boolean> {
    if (!igBusinessId) return false;

    const params = new URLSearchParams({
      fields: "id,username",
      access_token: accessToken,
    });

    const res = await fetch(
      `https://graph.instagram.com/v24.0/${igBusinessId}?${params.toString()}`
    );
    const raw = await res.json();

    return !raw.error;
  }

  /** get IG Business profile */
  async getProfile(accessToken: string, igBusinessId?: string) {
    if (!igBusinessId) return null;

    const params = new URLSearchParams({
      fields: "id,username,name,profile_picture_url",
      access_token: accessToken,
    });

    const res = await fetch(
      `https://graph.instagram.com/v24.0/${igBusinessId}?${params.toString()}`
    );
    const raw = await res.json();

    if (raw.error) return null;
    return raw;
  }

  /** optional revoke */
  async revokeToken(accessToken: string): Promise<boolean> {
    const params = new URLSearchParams({ access_token: accessToken });

    const res = await fetch(
      `https://graph.instagram.com/v24.0/me/permissions?${params.toString()}`,
      { method: "DELETE" }
    );
    const raw = await res.json();

    return !!raw.success;
  }
}
