import type { MessagingService, MessagingAdapterFactory } from "@/core/application/interfaces/messaging/messaging-adapter";
import type { Platform } from "@/core/domain/marketing/post";
import { isTokenExpired } from "@/core/domain/social/social-auth";
import { SocialAuthRepository } from "@/infrastructure/repositories/social/social-auth-repo";
import { OAuthAdapterFactory } from "./oauth-adapter-factory";

/**
 * Platform Messaging Adapter Factory
 * Creates messaging adapters with automatic token validation and refresh
 */
export class PlatformMessagingAdapterFactory implements MessagingAdapterFactory {
  private messagingAdapters: Map<string, MessagingService> = new Map();
  private socialAuthRepo: SocialAuthRepository;

  constructor() {
    this.socialAuthRepo = new SocialAuthRepository();
  }

  async create(platform: Platform, channelId: string): Promise<MessagingService> {
    // Validate platform
    const socialPlatform = this.validateSocialPlatform(platform);
    const cacheKey = `${platform}-${channelId}`;

    // Get auth data from database by channel ID
    let auth = await this.socialAuthRepo.getByChannelAndPlatform(channelId, socialPlatform);

    if (!auth) {
      throw new Error(`${platform} channel not connected: ${channelId}`);
    }

    // Check if token is expired and refresh if needed
    if (isTokenExpired(auth.expiresAt)) {
      console.log(`Token expired for ${platform} (channel: ${channelId}), refreshing...`);
      auth = await this.refreshTokenIfNeeded(socialPlatform, auth);

      // Clear cache to force recreation with new token
      this.messagingAdapters.delete(cacheKey);
    }

    // Return cached adapter if exists
    if (this.messagingAdapters.has(cacheKey)) {
      return this.messagingAdapters.get(cacheKey)!;
    }

    // Extract token and create adapter
    const token = auth.accessToken;
    const pageId = auth.openId;

    // Create messaging adapter with simple token
    const adapter = await this.createMessagingAdapter(socialPlatform, token, pageId);

    // Cache the adapter
    this.messagingAdapters.set(cacheKey, adapter);
    return adapter;
  }

  /**
   * Validate and convert platform to social platform
   */
  private validateSocialPlatform(platform: Platform): Platform {
    if (platform === "website" || platform === "telegram") {
      throw new Error(`Platform ${platform} does not support social auth messaging`);
    }
    return platform as Platform;
  }

  /**
   * Refresh token if expired
   */
  private async refreshTokenIfNeeded(platform: Platform, auth: any) {
    if (!auth.refreshToken && !auth.accessToken) {
      throw new Error(`Cannot refresh token for ${platform}: No refresh token or access token available`);
    }

    try {
      const oauthAdapter = await new OAuthAdapterFactory().getAdapter(platform);

      // Use refreshToken if available, otherwise use accessToken (for Facebook)
      const tokenToRefresh = auth.refreshToken || auth.accessToken;

      if (!oauthAdapter.refreshToken) {
        throw new Error(`Platform ${platform} does not support token refresh`);
      }

      const refreshResult = await oauthAdapter.refreshToken(tokenToRefresh);

      // Update token in database
      const updatedAuth = await this.socialAuthRepo.refreshToken({
        userId: auth.userId,
        platform: auth.platform,
        newAccessToken: refreshResult.accessToken,
        newRefreshToken: refreshResult.refreshToken || auth.refreshToken || auth.accessToken,
        expiresInSeconds: refreshResult.expiresIn,
      });

      if (!updatedAuth) {
        throw new Error(`Failed to update refreshed token in database for ${platform}`);
      }

      console.log(`Token refreshed successfully for ${platform} (channel: ${auth.openId})`);
      return updatedAuth;

    } catch (error) {
      console.error(`Failed to refresh token for ${platform}:`, error);
      throw new Error(`Token refresh failed for ${platform}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create platform-specific messaging adapter
   */
  private async createMessagingAdapter(
    platform: Platform,
    token: string,
    pageId: string
  ): Promise<MessagingService> {
    switch (platform) {
      case "facebook": {
        const { FacebookMessagingAdapter } = await import("../messaging/facebook-messaging-adapter");
        return new FacebookMessagingAdapter(token, pageId);
      }

      case "tiktok": {
        const { TikTokMessagingAdapter } = await import("../messaging/tiktok-messaging-adapter");
        return new TikTokMessagingAdapter(token);
      }

      case "zalo": {
        const { ZaloMessagingAdapter } = await import("../messaging/zalo-messaging-adapter");
        return new ZaloMessagingAdapter(token, pageId);
      }

      default:
        throw new Error(`Unsupported platform for messaging: ${platform}`);
    }
  }

  clearCache(): void {
    this.messagingAdapters.clear();
  }

}

/**
 * Singleton instance
 */
let messagingAdapterFactory: PlatformMessagingAdapterFactory | null = null;

/**
 * Get messaging adapter factory instance (singleton)
 */
export function getMessagingAdapterFactory(): PlatformMessagingAdapterFactory {
  if (!messagingAdapterFactory) {
    messagingAdapterFactory = new PlatformMessagingAdapterFactory();
  }
  return messagingAdapterFactory;
}
