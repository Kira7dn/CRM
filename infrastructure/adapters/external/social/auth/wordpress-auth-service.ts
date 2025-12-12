import { BasePlatformOAuthService } from "./utils/base-auth-service";
import type { PlatformOAuthConfig } from "@/core/application/interfaces/social/platform-oauth-adapter";

export interface WordPressAuthConfig extends PlatformOAuthConfig {
  siteUrl?: string; // WordPress site URL (blog_url from Jetpack)
  blogId?: string; // WordPress.com blog ID (unique identifier)
}

/**
 * WordPress Authentication Service using Jetpack OAuth
 * Works for both WordPress.com and self-hosted WordPress with Jetpack
 */
export class WordPressAuthService extends BasePlatformOAuthService {
  protected baseUrl = "https://public-api.wordpress.com/rest/v1.1";
  private _cachedAccessToken: string | null = null;
  private _tokenExpireTime: number | null = null;

  constructor(private wpConfig: WordPressAuthConfig) {
    super(wpConfig);
  }

  /**
   * Exchange authorization code for access token
   * Implements PlatformOAuthService.exchangeCodeForToken interface method
   */
  async exchangeCodeForToken(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<{
    access_token: string;
    blog_id: string;
    blog_url: string;
    token_type: string;
    scope: string;
  }> {
    const payload = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    this.log(`Exchanging token with redirect_uri: ${redirectUri}`);

    const res = await fetch("https://public-api.wordpress.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload.toString(),
    });

    if (!res.ok) {
      const errorText = await res.text();
      this.log(`Token exchange failed: ${res.status} - ${errorText}`);
      throw new Error(`Token exchange failed: ${res.status} - ${errorText}`);
    }

    const data = await res.json();

    this.log(`Token exchange successful: blog_id=${data.blog_id}, blog_url=${data.blog_url}`);

    return data;
  }

  /**
   * Get valid access token, refreshing if necessary
   */
  private async getValidAccessToken(): Promise<string> {
    // Check if we have a cached token that's still valid
    if (this._cachedAccessToken && this._tokenExpireTime && Date.now() < this._tokenExpireTime) {
      return this._cachedAccessToken;
    }

    // Check if the config token is expired
    if (this.isExpired()) {
      // Refresh the token
      const { accessToken, expiresIn } = await this.refreshToken();
      this._cachedAccessToken = accessToken;
      this._tokenExpireTime = Date.now() + (expiresIn * 1000) - (5 * 60 * 1000); // 5 min buffer
      return accessToken;
    }

    // Use the token from config
    return this.getAccessToken();
  }

  /**
   * Verify if authentication is valid by calling WordPress API
   * Uses Jetpack API endpoint (works for both .com and self-hosted)
   * @returns true if authentication is valid, false otherwise
   */
  async verifyAuth(): Promise<boolean> {
    try {
      const token = await this.getValidAccessToken();

      if (!this.wpConfig.blogId) {
        this.log("No blog ID available for verification");
        return false;
      }

      const url = `${this.baseUrl}/sites/${this.wpConfig.blogId}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return !data.error;
    } catch (error) {
      console.error("WordPress auth verification failed:", error);
      return false;
    }
  }

  /**
   * Refresh access token
   * Note: Jetpack OAuth tokens don't expire, so this always returns null
   * @returns null (Jetpack tokens are permanent)
   */
  async refreshToken(): Promise<{ accessToken: string; expiresIn: number }> {
    this.log("Jetpack OAuth tokens do not expire and cannot be refreshed");
    // Return default values for compatibility with caching logic
    return {
      accessToken: this.getAccessToken(),
      expiresIn: 3600, // 1 hour default
    };
  }

  /**
   * Get WordPress authentication data for posting adapter
   * @returns WordPress auth data
   */
  getAuthData() {
    // Determine token type based on available data
    const isWpCom = !!this.wpConfig.blogId && !this.wpConfig.siteUrl?.includes('wp-json');

    return {
      accessToken: this.getAccessToken(),
      tokenType: isWpCom ? "wpcom" as const : "self-host" as const,
      siteUrl: this.wpConfig.siteUrl,
      siteId: this.wpConfig.blogId,
    };
  }
}
