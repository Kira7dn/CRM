import axios from "axios";

export interface WordPressOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  siteUrl?: string; // WordPress site URL (for display and API calls)
  blogId?: string; // WordPress.com blog ID (required for Jetpack)
}

/**
 * WordPress OAuth Gateway using Jetpack OAuth
 * Unified OAuth flow for both WordPress.com and self-hosted WordPress with Jetpack
 *
 * All WordPress sites (including self-hosted with Jetpack) use WordPress.com OAuth endpoints
 * Reference: https://developer.wordpress.com/docs/oauth2/
 */
export class WordPressOAuthGateway {
  private static readonly OAUTH_BASE = "https://public-api.wordpress.com/oauth2";

  constructor(private cfg: WordPressOAuthConfig) { }

  /**
   * Generate Jetpack OAuth authorization URL
   * Works for both WordPress.com and self-hosted WordPress with Jetpack
   * @param state Optional state parameter for CSRF protection
   * @returns Authorization URL to redirect user to
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.cfg.clientId,
      redirect_uri: this.cfg.redirectUri,
      response_type: "code",
      scope: "posts media", // Full access to site
    });

    if (state) {
      params.set("state", state);
    }

    // If blogId is provided, pre-select the site
    if (this.cfg.blogId) {
      params.set("blog", this.cfg.blogId);
    }

    return `${WordPressOAuthGateway.OAUTH_BASE}/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   * Always uses WordPress.com OAuth endpoint (works for both .com and Jetpack sites)
   * @param code Authorization code from OAuth callback
   * @returns Token data including access_token, blog_id, blog_url, token_type, scope
   */
  async exchangeToken(code: string): Promise<{
    access_token: string;
    blog_id: string;
    blog_url: string;
    token_type: string;
    scope: string;
  }> {
    const payload = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: this.cfg.redirectUri,
      client_id: this.cfg.clientId,
      client_secret: this.cfg.clientSecret,
    });

    console.log("[WordPressOAuthGateway] Exchanging token with redirect_uri:", this.cfg.redirectUri);

    const res = await axios.post(
      `${WordPressOAuthGateway.OAUTH_BASE}/token`,
      payload.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    console.log("[WordPressOAuthGateway] Token exchange response:", {
      blog_id: res.data.blog_id,
      blog_url: res.data.blog_url,
      scope: res.data.scope,
      hasAccessToken: !!res.data.access_token,
    });

    return res.data;
  }

  /**
   * Get site information using access token
   * @param accessToken OAuth access token
   * @param blogId WordPress.com blog ID
   * @returns Site information
   */
  async getSiteInfo(accessToken: string, blogId: string): Promise<any> {
    const res = await axios.get(
      `https://public-api.wordpress.com/rest/v1.1/sites/${blogId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return res.data;
  }
}
