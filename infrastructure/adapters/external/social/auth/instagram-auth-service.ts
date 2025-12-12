import { BasePlatformOAuthService } from "./utils/base-auth-service";
import type { PlatformOAuthConfig } from "@/core/application/interfaces/social/platform-oauth-adapter";

/**
 * Instagram-specific configuration
 * Instagram uses Facebook Graph API, so we need Facebook App credentials
 */
export interface InstagramAuthConfig extends PlatformOAuthConfig {
  appId: string;
  appSecret: string;
  instagramBusinessAccountId?: string;
}

/**
 * Instagram Authentication Service
 * Handles Instagram Business Account access token management via Facebook Graph API
 *
 * Note: Instagram doesn't have a separate OAuth - it uses Facebook Login
 * and requires an Instagram Business Account linked to a Facebook Page
 */
export class InstagramAuthService extends BasePlatformOAuthService {
  protected baseUrl = "https://graph.facebook.com/v19.0";
  private _cachedAccessToken: string | null = null;
  private _tokenExpireTime: number | null = null;

  constructor(private igConfig: InstagramAuthConfig) {
    super(igConfig);
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
   * Verify Instagram account is still accessible
   */
  async verifyAuth(): Promise<boolean> {
    try {
      const token = await this.getValidAccessToken();
      const igAccountId = this.igConfig.instagramBusinessAccountId || this.igConfig.pageId;

      if (!igAccountId) {
        this.logError("No Instagram Business Account ID configured", new Error("Missing IG account ID"));
        return false;
      }

      const url = `${this.baseUrl}/${igAccountId}`;
      const params = new URLSearchParams({
        fields: "id,username",
        access_token: token,
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();

      return !data.error;
    } catch (error) {
      this.logError("Failed to verify Instagram auth", error);
      return false;
    }
  }

  /**
   * Refresh long-lived token
   * Instagram tokens are long-lived (60 days) and can be refreshed
   */
  async refreshToken(): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const currentToken = this.getAccessToken();

      // Instagram Graph API: refresh long-lived token
      const params = new URLSearchParams({
        grant_type: "ig_refresh_token",
        access_token: currentToken,
      });

      const response = await fetch(
        `https://graph.instagram.com/refresh_access_token?${params.toString()}`
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
      this.logError("Failed to refresh Instagram token", error);
      throw error;
    }
  }

  /**
   * Get Instagram Business Account ID from Facebook Page
   */
  async getInstagramBusinessAccount(pageId: string): Promise<{
    id: string;
    username: string;
  } | null> {
    try {
      const token = await this.getValidAccessToken();
      const url = `${this.baseUrl}/${pageId}`;
      const params = new URLSearchParams({
        fields: "instagram_business_account{id,username}",
        access_token: token,
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();

      if (data.error || !data.instagram_business_account) {
        this.logError("Page does not have Instagram Business Account linked", data.error);
        return null;
      }

      return data.instagram_business_account;
    } catch (error) {
      this.logError("Failed to get Instagram Business Account", error);
      return null;
    }
  }

  /**
   * Get Instagram Business Account details
   */
  async getAccountDetails(): Promise<{
    id: string;
    username: string;
    name?: string;
    profile_picture_url?: string;
  } | null> {
    try {
      const token = await this.getValidAccessToken();
      const igAccountId = this.igConfig.instagramBusinessAccountId || this.igConfig.pageId;

      if (!igAccountId) {
        return null;
      }

      const url = `${this.baseUrl}/${igAccountId}`;
      const params = new URLSearchParams({
        fields: "id,username,name,profile_picture_url",
        access_token: token,
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();

      if (data.error) {
        this.logError("Failed to get account details", data.error);
        return null;
      }

      return data;
    } catch (error) {
      this.logError("Failed to get Instagram account details", error);
      return null;
    }
  }
}
