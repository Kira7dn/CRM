import { BasePlatformAuthService } from "./base-auth-service";
import type { PlatformAuthConfig } from "@/core/application/interfaces/social/auth-service";

/**
 * Zalo-specific configuration
 */
export interface ZaloAuthConfig extends PlatformAuthConfig {
  appId: string;
  appSecret: string;
  refreshToken?: string;
}

/**
 * Zalo Authentication Service
 * Handles OA access token verification and API communication
 */
export class ZaloAuthService extends BasePlatformAuthService {
  protected baseUrl = "https://openapi.zaloapp.com/oa/v3";

  constructor(private zaloConfig: ZaloAuthConfig) {
    super(zaloConfig);
  }

  /** Verify that OA access token is valid by calling getoa */
  async verifyAuth(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/v2.0/oa/getoa`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          access_token: this.getAccessToken(),
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

/**
 * Factory function to create ZaloAuthService from user's stored credentials
 */
export async function createZaloAuthServiceForUser(
  userId: string
): Promise<ZaloAuthService> {
  const { SocialAuthRepository } = await import(
    "@/infrastructure/repositories/social/social-auth-repo"
  );
  const { ObjectId } = await import("mongodb");

  const repo = new SocialAuthRepository();
  const auth = await repo.getByUserAndPlatform(
    new ObjectId(userId),
    "zalo"
  );

  if (!auth) {
    throw new Error("Zalo account not connected for this user");
  }

  if (new Date() >= auth.expiresAt) {
    throw new Error("Zalo token has expired. Please reconnect your account.");
  }

  const config: ZaloAuthConfig = {
    appId: process.env.ZALO_APP_ID || "",
    appSecret: process.env.ZALO_APP_SECRET || "",
    pageId: auth.openId, // OA ID
    accessToken: auth.accessToken,
    expiresAt: auth.expiresAt,
    refreshToken: auth.refreshToken, // optional field
  };

  if (!config.appId || !config.appSecret) {
    throw new Error(
      "Missing Zalo configuration. Set ZALO_APP_ID and ZALO_APP_SECRET."
    );
  }

  return new ZaloAuthService(config);
}
