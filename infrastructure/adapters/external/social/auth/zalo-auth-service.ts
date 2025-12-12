import { BasePlatformOAuthService } from "./utils/base-auth-service";
import type { PlatformOAuthConfig } from "@/core/application/interfaces/social/platform-oauth-adapter";

/**
 * Zalo-specific configuration
 */
export interface ZaloAuthConfig extends PlatformOAuthConfig {
  appId: string;
  appSecret: string;
  refreshToken?: string;
}

/**
 * Zalo Authentication Service
 * Handles OA access token verification and API communication
 */
export class ZaloAuthService extends BasePlatformOAuthService {
  protected baseUrl = "https://openapi.zaloapp.com/oa/v3";
  private _cachedAccessToken: string | null = null;
  private _tokenExpireTime: number | null = null;

  constructor(private zaloConfig: ZaloAuthConfig) {
    super(zaloConfig);
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

  /** Verify that OA access token is valid by calling getoa */
  async verifyAuth(): Promise<boolean> {
    try {
      const token = await this.getValidAccessToken();
      const url = `${this.baseUrl}/v2.0/oa/getoa`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          access_token: token,
        },
      });
      const data = await response.json();
      // Nếu có error hoặc không có data.data => không hợp lệ
      if (data.error || !data.data) {
        this.logError("Zalo OA verify failed", data);
        return false;
      }
      return true;
    } catch (err) {
      this.logError("Zalo OA verify exception", err);
      return false;
    }
  }

  /**
   * Refresh token flow (Zalo may not always issue refresh_token)
   * But implement template for future support
   */
  async refreshToken(): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const url = `https://oauth.zaloapp.com/v4/oa/access_token`;
      const body = new URLSearchParams({
        app_id: this.zaloConfig.appId,
        grant_type: "refresh_token",
        refresh_token: this.getAccessToken() || "",
      });

      const response = await fetch(url, {
        method: "POST",
        body,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error_description || "Failed to refresh Zalo token");
      }

      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      };
    } catch (error) {
      this.logError("Failed to refresh Zalo token", error);
      throw error;
    }
  }
}
