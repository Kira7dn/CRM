import type { Platform } from "@/core/domain/marketing/post";
import type { PostingService, PostingAdapterFactory } from "@/core/application/interfaces/social/posting-adapter";
import type { PlatformAuthService } from "@/core/application/interfaces/social/auth-service";

/**
 * Platform Posting Adapter Factory
 * Creates posting adapters with shared authentication service
 */
export class PlatformPostingAdapterFactory implements PostingAdapterFactory {
  // Cache key: `${platform}-${userId}`
  private authServices: Map<string, PlatformAuthService> = new Map();
  private postingAdapters: Map<string, PostingService> = new Map();

  async create(platform: Platform, userId: string): Promise<PostingService> {
    if (!userId) {
      throw new Error(`User ID is required for ${platform} posting`);
    }

    const cacheKey = `${platform}-${userId}`;

    // Return cached adapter if exists
    if (this.postingAdapters.has(cacheKey)) {
      return this.postingAdapters.get(cacheKey)!;
    }

    // Get or create auth service
    const authService = await this.getOrCreateAuthService(platform, userId);

    // Create posting adapter with auth service
    let adapter: PostingService;

    switch (platform) {
      case "facebook": {
        const { FacebookPostingAdapter } = await import("../posting/facebook-posting-adapter");
        adapter = new FacebookPostingAdapter(authService as any);
        break;
      }

      case "tiktok": {
        const { TikTokPostingAdapter } = await import("../posting/tiktok-posting-adapter");
        adapter = new TikTokPostingAdapter(authService as any);
        break;
      }

      case "zalo": {
        const { ZaloPostingAdapter } = await import("../posting/zalo-posting-adapter");
        adapter = new ZaloPostingAdapter(authService as any);
        break;
      }

      case "youtube": {
        const { YouTubePostingAdapter } = await import("../posting/youtube-posting-adapter");
        adapter = new YouTubePostingAdapter(authService as any);
        break;
      }

      default:
        throw new Error(`Unsupported platform for posting: ${platform}`);
    }

    // Cache the adapter
    this.postingAdapters.set(cacheKey, adapter);
    return adapter;
  }

  private async getOrCreateAuthService(
    platform: Platform,
    userId: string
  ): Promise<PlatformAuthService> {
    const cacheKey = `${platform}-${userId}`;

    if (this.authServices.has(cacheKey)) {
      return this.authServices.get(cacheKey)!;
    }

    let authService: PlatformAuthService;

    switch (platform) {
      case "facebook": {
        const { createFacebookAuthServiceForUser } = await import("../auth/facebook-auth-service");
        authService = await createFacebookAuthServiceForUser(userId);
        break;
      }

      case "tiktok": {
        const { createTikTokAuthServiceForUser } = await import("../auth/tiktok-auth-service");
        authService = await createTikTokAuthServiceForUser(userId);
        break;
      }

      case "zalo": {
        const { createZaloAuthServiceForUser } = await import("../auth/zalo-auth-service");
        authService = await createZaloAuthServiceForUser(userId);
        break;
      }

      case "youtube": {
        const { createYouTubeAuthServiceForUser } = await import("../auth/youtube-auth-service");
        authService = await createYouTubeAuthServiceForUser(userId);
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
    this.postingAdapters.clear();
  }

  clearUserCache(platform: Platform, userId: string): void {
    const cacheKey = `${platform}-${userId}`;
    this.authServices.delete(cacheKey);
    this.postingAdapters.delete(cacheKey);
  }

  getSupportedPlatforms(): Platform[] {
    return ["facebook", "tiktok", "zalo", "youtube"];
  }

  isSupported(platform: Platform): boolean {
    return this.getSupportedPlatforms().includes(platform);
  }
}

/**
 * Singleton instance
 */
let postingAdapterFactory: PlatformPostingAdapterFactory | null = null;

/**
 * Get posting adapter factory instance (singleton)
 */
export function getPostingAdapterFactory(): PlatformPostingAdapterFactory {
  if (!postingAdapterFactory) {
    postingAdapterFactory = new PlatformPostingAdapterFactory();
  }
  return postingAdapterFactory;
}
