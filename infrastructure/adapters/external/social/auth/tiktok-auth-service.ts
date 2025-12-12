import { BasePlatformOAuthService } from "./utils/base-auth-service";
import type { PlatformOAuthConfig } from "@/core/application/interfaces/social/platform-oauth-adapter";

export interface TikTokAuthConfig extends PlatformOAuthConfig {
  clientKey: string;
  clientSecret: string;
  refreshToken?: string; // cần cho refresh
}

export class TikTokAuthService extends BasePlatformOAuthService {
  protected baseUrl = "https://open.tiktokapis.com";
  private _cachedAccessToken: string | null = null;
  private _tokenExpireTime: number | null = null;

  constructor(private tkConfig: TikTokAuthConfig) {
    super(tkConfig);
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

  /** Verify access token bằng cách lấy thông tin user */
  async verifyAuth(): Promise<boolean> {
    try {
      const token = await this.getValidAccessToken();
      const url = `${this.baseUrl}/v2/user/info/?fields=open_id,display_name,avatar_url`;
      const resp = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();
      return !!data.data?.user; // nếu có user info => token hợp lệ
    } catch (err) {
      this.logError("TikTok verifyAuth failed", err);
      return false;
    }
  }

  /** Refresh access token khi hết hạn */
  async refreshToken(): Promise<{ accessToken: string; expiresIn: number; refreshToken: string }> {
    if (!this.tkConfig.refreshToken) {
      throw new Error("No refresh token available");
    }

    const url = `${this.baseUrl}/v2/oauth/token/`;
    const body = new URLSearchParams({
      client_key: this.tkConfig.clientKey,
      client_secret: this.tkConfig.clientSecret,
      grant_type: "refresh_token",
      refresh_token: this.tkConfig.refreshToken,
    });

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = await resp.json();
    if (data.error_code && data.error_code !== 0) {
      throw new Error(data.description || "TikTok refresh token failed");
    }

    // Cập nhật token mới vào service
    this.tkConfig.accessToken = data.data.access_token;
    this.tkConfig.refreshToken = data.data.refresh_token;
    this.tkConfig.expiresAt = new Date(Date.now() + data.data.expires_in * 1000);

    return {
      accessToken: data.data.access_token,
      refreshToken: data.data.refresh_token,
      expiresIn: data.data.expires_in,
    };
  }
}
