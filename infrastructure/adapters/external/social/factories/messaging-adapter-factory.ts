import type { Platform } from "@/core/domain/messaging/message";
import type { MessagingService, MessagingAdapterFactory } from "@/core/application/interfaces/social/messaging-adapter";
import type { PlatformAuthService } from "@/core/application/interfaces/social/auth-service";

/**
 * Platform Messaging Adapter Factory
 * Creates messaging adapters with shared authentication service
 */
export class PlatformMessagingAdapterFactory implements MessagingAdapterFactory {
  // Cache key: `${platform}-${channelId}`
  private authServices: Map<string, PlatformAuthService> = new Map();
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
  ): Promise<PlatformAuthService> {
    const cacheKey = `${platform}-${channelId}`;

    if (this.authServices.has(cacheKey)) {
      return this.authServices.get(cacheKey)!;
    }

    let authService: PlatformAuthService;

    switch (platform) {
      case "facebook": {
        const { createFacebookAuthServiceForChannel } = await import("../auth/facebook-auth-service");
        authService = await createFacebookAuthServiceForChannel(channelId);
        break;
      }

      case "tiktok": {
        const { createTikTokAuthServiceForUser } = await import("../auth/tiktok-auth-service");
        authService = await createTikTokAuthServiceForUser(channelId);
        break;
      }

      case "zalo": {
        const { createZaloAuthServiceForUser } = await import("../auth/zalo-auth-service");
        authService = await createZaloAuthServiceForUser(channelId);
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
