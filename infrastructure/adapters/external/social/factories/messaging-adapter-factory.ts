import type { Platform } from "@/core/domain/messaging/message";
import type { SocialPlatform } from "@/core/domain/social/social-auth";
import type { MessagingService, MessagingAdapterFactory } from "@/core/application/interfaces/messaging/messaging-adapter";
import type { PlatformOAuthService } from "@/core/application/interfaces/social/platform-oauth-adapter";

/**
 * Platform Messaging Adapter Factory
 * Creates messaging adapters with shared authentication service
 */
export class PlatformMessagingAdapterFactory implements MessagingAdapterFactory {
  // Cache key: `${platform}-${channelId}`
  private authServices: Map<string, PlatformOAuthService> = new Map();
  private messagingAdapters: Map<string, MessagingService> = new Map();

  async create(platform: Platform, channelId: string): Promise<MessagingService> {
    const cacheKey = `${platform}-${channelId}`;

    // Return cached adapter if exists
    if (this.messagingAdapters.has(cacheKey)) {
      return this.messagingAdapters.get(cacheKey)!;
    }

    // Get or create auth service
    const authService = await this.getOrCreateAuthService(platform, channelId);

    // Create messaging adapter with auth service
    let adapter: MessagingService;

    switch (platform) {
      case "facebook": {
        const { FacebookMessagingAdapter } = await import("../messaging/facebook-messaging-adapter");
        adapter = new FacebookMessagingAdapter(authService as any);
        break;
      }

      case "tiktok": {
        const { TikTokMessagingAdapter } = await import("../messaging/tiktok-messaging-adapter");
        adapter = new TikTokMessagingAdapter(authService as any);
        break;
      }

      case "zalo": {
        const { ZaloMessagingAdapter } = await import("../messaging/zalo-messaging-adapter");
        adapter = new ZaloMessagingAdapter(authService as any);
        break;
      }

      case "website":
      case "telegram":
        throw new Error(`${platform} messaging not yet implemented`);

      default:
        throw new Error(`Unsupported platform for messaging: ${platform}`);
    }

    // Cache the adapter
    this.messagingAdapters.set(cacheKey, adapter);
    return adapter;
  }

  /**
   * Create messaging adapter using system credentials (for messaging without user context)
   */
  // async createForMessaging(platform: Platform, channelId: string): Promise<MessagingService> {
  //   return this.create(platform, userId);
  // }

  private async getOrCreateAuthService(
    platform: Platform,
    channelId: string
  ): Promise<PlatformOAuthService> {
    const cacheKey = `${platform}-${channelId}`;

    if (this.authServices.has(cacheKey)) {
      return this.authServices.get(cacheKey)!;
    }

    // Filter out non-social platforms
    if (platform === "website" || platform === "telegram") {
      throw new Error(`Platform ${platform} does not support social auth messaging`);
    }

    // Get auth data from database by channel ID
    const { SocialAuthRepository } = await import("@/infrastructure/repositories/social/social-auth-repo");

    const repo = new SocialAuthRepository();
    const auth = await repo.getByChannelAndPlatform(channelId, platform as SocialPlatform);

    if (!auth) {
      throw new Error(`${platform} channel not connected: ${channelId}`);
    }

    if (new Date() >= auth.expiresAt) {
      throw new Error(`${platform} token has expired. Please reconnect your account.`);
    }

    let authService: PlatformOAuthService;

    switch (platform) {
      case "facebook": {
        const { FacebookAuthService } = await import("../auth/facebook-auth-service");
        authService = new FacebookAuthService({
          appId: process.env.FACEBOOK_APP_ID || "",
          appSecret: process.env.FACEBOOK_APP_SECRET || "",
          pageId: auth.openId,
          accessToken: auth.accessToken,
          expiresAt: auth.expiresAt,
        });
        break;
      }

      case "tiktok": {
        const { TikTokAuthService } = await import("../auth/tiktok-auth-service");
        authService = new TikTokAuthService({
          clientKey: process.env.TIKTOK_CLIENT_KEY || "",
          clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
          expiresAt: auth.expiresAt,
        });
        break;
      }

      case "zalo": {
        const { ZaloAuthService } = await import("../auth/zalo-auth-service");
        authService = new ZaloAuthService({
          appId: process.env.ZALO_APP_ID || "",
          appSecret: process.env.ZALO_APP_SECRET || "",
          pageId: auth.openId,
          accessToken: auth.accessToken,
          expiresAt: auth.expiresAt,
          refreshToken: auth.refreshToken,
        });
        break;
      }

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    this.authServices.set(cacheKey, authService);
    return authService;
  }

  clearCache(): void {
    this.authServices.clear();
    this.messagingAdapters.clear();
  }

  getSupportedPlatforms(): Platform[] {
    return ["facebook", "tiktok", "zalo"];
  }

  isSupported(platform: Platform): boolean {
    return this.getSupportedPlatforms().includes(platform);
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
