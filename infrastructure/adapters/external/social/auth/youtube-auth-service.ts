import { BasePlatformOAuthService } from "./utils/base-auth-service";
import type { PlatformOAuthConfig } from "@/core/application/interfaces/social/platform-oauth-adapter";

export interface YouTubeAuthConfig extends PlatformOAuthConfig {
  apiKey: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export class YouTubeAuthService extends BasePlatformOAuthService {
  protected baseUrl = "https://www.googleapis.com/youtube/v3";
  private _cachedAccessToken: string | null = null;
  private _tokenExpireTime: number | null = null;

  constructor(private ytConfig: YouTubeAuthConfig) {
    super(ytConfig);
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
      const url = `${this.baseUrl}/channels`;
      const params = new URLSearchParams({
        part: "snippet",
        mine: "true",
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return !data.error;
    } catch (error) {
      console.error("YouTube auth verification failed:", error);
      return false;
    }
  }

  async refreshToken(): Promise<{ accessToken: string; expiresIn: number }> {
    const url = "https://oauth2.googleapis.com/token";
    const params = new URLSearchParams({
      client_id: this.ytConfig.clientId,
      client_secret: this.ytConfig.clientSecret,
      refresh_token: this.ytConfig.refreshToken,
      grant_type: "refresh_token",
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error_description || errorData.error || errorMessage;
        } catch (e) {
          // Ignore JSON parse error
        }
        throw new Error(`YouTube API error: ${errorMessage}`);
      }

      const data = await response.json();

      if (!data.access_token || !data.expires_in) {
        throw new Error("Invalid token response: missing access_token or expires_in");
      }

      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in, // seconds
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to refresh YouTube token:", errorMessage);
      throw new Error(`Failed to refresh YouTube token: ${errorMessage}`);
    }
  }
}
