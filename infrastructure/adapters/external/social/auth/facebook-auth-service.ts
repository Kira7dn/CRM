import { BasePlatformAuthService } from "./platform-auth-service";
import type { PlatformAuthConfig } from "@/core/application/interfaces/social/auth-service";

/**
 * Facebook-specific configuration
 */
export interface FacebookAuthConfig extends PlatformAuthConfig {
  appId: string;
  appSecret: string;
}

/**
 * Facebook Authentication Service
 * Handles Facebook page access token management and verification
 */
export class FacebookAuthService extends BasePlatformAuthService {
  protected baseUrl = "https://graph.facebook.com/v19.0";

  constructor(private fbConfig: FacebookAuthConfig) {
    super(fbConfig);
  }

  async verifyAuth(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/me`;
      const params = new URLSearchParams({
        access_token: this.getAccessToken(),
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
      const url = `${this.baseUrl}/${pageId}`;
      const params = new URLSearchParams({
        fields: "access_token",
        access_token: this.getAccessToken(),
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

/**
 * Factory function to create FacebookAuthService from user's stored credentials
 */
export async function createFacebookAuthServiceForUser(userId: string): Promise<FacebookAuthService> {
  const { SocialAuthRepository } = await import("@/infrastructure/repositories/social/social-auth-repo");
  const { ObjectId } = await import("mongodb");

  const repo = new SocialAuthRepository();
  const auth = await repo.getByUserAndPlatform(new ObjectId(userId), "facebook");

  if (!auth) {
    throw new Error("Facebook account not connected for this user");
  }

  if (new Date() >= auth.expiresAt) {
    throw new Error("Facebook token has expired. Please reconnect your account.");
  }

  const config: FacebookAuthConfig = {
    appId: process.env.FACEBOOK_APP_ID || "",
    appSecret: process.env.FACEBOOK_APP_SECRET || "",
    pageId: auth.openId,
    accessToken: auth.accessToken,
    expiresAt: auth.expiresAt,
  };

  if (!config.appId || !config.appSecret) {
    throw new Error("Missing Facebook client configuration. Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET.");
  }

  return new FacebookAuthService(config);
}

/**
 * Factory function to create FacebookAuthService from channel ID (Page ID)
 */
export async function createFacebookAuthServiceForChannel(channelId: string): Promise<FacebookAuthService> {
  const { SocialAuthRepository } = await import("@/infrastructure/repositories/social/social-auth-repo");

  const repo = new SocialAuthRepository();
  const auth = await repo.getByChannelAndPlatform(channelId, "facebook");

  if (!auth) {
    throw new Error(`Facebook Page not connected: ${channelId}`);
  }

  if (new Date() >= auth.expiresAt) {
    throw new Error("Facebook token has expired. Please reconnect your account.");
  }

  const config: FacebookAuthConfig = {
    appId: process.env.FACEBOOK_APP_ID || "",
    appSecret: process.env.FACEBOOK_APP_SECRET || "",
    pageId: auth.openId,
    accessToken: auth.accessToken,
    expiresAt: auth.expiresAt,
  };

  if (!config.appId || !config.appSecret) {
    throw new Error("Missing Facebook client configuration. Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET.");
  }

  return new FacebookAuthService(config);
}