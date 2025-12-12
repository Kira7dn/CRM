import { BasePlatformOAuthService } from "./utils/base-auth-service";
import type { PlatformOAuthConfig } from "@/core/application/interfaces/social/platform-oauth-adapter";

/**
 * Facebook-specific configuration
 */
export interface FacebookAuthConfig extends PlatformOAuthConfig {
  appId: string;
  appSecret: string;
}

/**
 * Facebook Authentication Service
 * Handles Facebook page access token management and verification
 */
export class FacebookAuthService extends BasePlatformOAuthService {
  protected baseUrl = "https://graph.facebook.com/v19.0";
  private _cachedAccessToken: string | null = null;
  private _tokenExpireTime: number | null = null;

  constructor(private fbConfig: FacebookAuthConfig) {
    super(fbConfig);
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

  async verifyAuth(): Promise<boolean> {
    try {
      const token = await this.getValidAccessToken();
      const url = `${this.baseUrl}/me`;
      const params = new URLSearchParams({
        access_token: token,
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();

      return !data.error;
    } catch (error) {
      this.logError("Failed to verify Facebook auth", error);
      return false;
    }
  }

  async refreshToken(): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const params = new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: this.fbConfig.appId,
        client_secret: this.fbConfig.appSecret,
        fb_exchange_token: this.getAccessToken(),
      });

      const response = await fetch(
        `https://graph.facebook.com/v19.0/oauth/access_token?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || "Failed to refresh token");
      }

      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in || 5184000, // 60 days default
      };
    } catch (error) {
      this.logError("Failed to refresh Facebook token", error);
      throw error;
    }
  }

  async getPageAccessToken(pageId: string): Promise<string> {
    try {
      const token = await this.getValidAccessToken();
      const url = `${this.baseUrl}/${pageId}`;
      const params = new URLSearchParams({
        fields: "access_token",
        access_token: token,
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      return data.access_token;
    } catch (error) {
      this.logError("Failed to get page access token", error);
      throw error;
    }
  }
}