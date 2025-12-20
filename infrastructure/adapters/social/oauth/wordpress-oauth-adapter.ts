import type { PlatformOAuthAdapter } from "@/core/application/interfaces/social/platform-oauth-adapter";

/**
 * WordPress OAuth config for exchange-only
 */
export interface WordPressOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * WordPress OAuth Adapter
 * — Supports WordPress.com and Jetpack-enabled self-hosted WP
 * — Stateless (does NOT store any token or expiration)
 */
export class WordPressOAuthAdapter implements PlatformOAuthAdapter {
  private readonly oauthTokenUrl = "https://public-api.wordpress.com/oauth2/token";
  private readonly apiBase = "https://public-api.wordpress.com/rest/v1.1";

  constructor(private readonly config: WordPressOAuthConfig) { }

  /**
   * Build authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: "code",
      redirect_uri: this.config.redirectUri,
      scope: "posts media",
    });

    if (state) params.set("state", state);

    return `https://public-api.wordpress.com/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Exchange auth code → access token + blog info
   */
  async exchangeCodeForToken(code: string) {
    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error("WordPress configuration missing");
    }

    const body = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
      grant_type: "authorization_code",
      code,
    });

    const res = await fetch(this.oauthTokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const raw = await res.json();

    if (!res.ok || raw.error) {
      throw new Error(raw.error_description || raw.error || "WordPress OAuth exchange failed");
    }

    // Fetch blog/site info to get name (pageName)
    let pageName = "";
    if (raw.blog_id) {
      try {
        const profile = await this.getProfile(raw.access_token, raw.blog_id.toString());
        pageName = profile?.name || `Blog ${raw.blog_id}`;
      } catch (error) {
        console.error("[WordPress OAuth] Error fetching blog info:", error);
        pageName = `Blog ${raw.blog_id}`;
      }
    }

    return {
      accessToken: raw.access_token,
      refreshToken: undefined, // WP.com tokens do not provide refresh
      expiresIn: 3600 * 24 * 365 * 10, // Jetpack tokens do not expire → fake large TTL
      providerAccountId: raw.blog_id?.toString() ?? "",
      scope: raw.scope,
      raw: {
        ...raw,
        pageName, // Add pageName for ConnectSocialAccountUseCase
      },
    };
  }

  /**
   * WordPress.com tokens DO NOT REFRESH
   * Always returns null → usecase will treat token as permanent
   */
  async refreshToken() {
    return {
      accessToken: "",
      refreshToken: undefined,
      expiresIn: 0,
      raw: null,
    };
  }

  /**
   * Verify token validity by calling /me
   */
  async verifyAccessToken(accessToken: string): Promise<boolean> {
    const res = await fetch(`${this.apiBase}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const raw = await res.json();
    return !raw.error;
  }

  /**
   * Get blog/site profile
   */
  async getProfile(accessToken: string, blogId?: string) {
    if (!blogId) return null;

    const res = await fetch(`${this.apiBase}/sites/${blogId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const raw = await res.json();

    if (raw.error) return null;

    return {
      id: raw.ID,
      name: raw.name,
      description: raw.description,
      url: raw.URL,
      icon: raw.icon?.img,
    };
  }

  /**
   * Revoke token (WP.com supports revoke through permissions delete)
   */
  async revokeToken(accessToken: string): Promise<boolean> {
    try {
      const res = await fetch(`https://public-api.wordpress.com/rest/v1.1/me/permissions`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Check if response is ok and has content
      if (!res.ok) {
        console.error(`WordPress revoke token failed: ${res.status} ${res.statusText}`);
        return false;
      }

      // Try to parse JSON, but handle empty or invalid responses
      const text = await res.text();
      if (!text) {
        // Empty response might mean success for DELETE operations
        return res.status === 200 || res.status === 204;
      }

      const raw = JSON.parse(text);
      return !!raw.success;
    } catch (error) {
      console.error("WordPress revoke token error:", error);
      return false;
    }
  }
}
