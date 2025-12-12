import type { Platform } from "@/core/domain/marketing/post";
import type { SocialPlatform } from "@/core/domain/social/social-auth";
import type { PostingService, PostingAdapterFactory } from "@/core/application/interfaces/marketing/posting-adapter";
import type { PlatformOAuthService } from "@/core/application/interfaces/social/platform-oauth-adapter";

/**
 * Platform Posting Adapter Factory
 * Creates posting adapters with shared authentication service
 */
export class PlatformPostingAdapterFactory implements PostingAdapterFactory {
  // Cache key: `${platform}-${userId}`
  private authServices: Map<string, PlatformOAuthService> = new Map();
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

      case "instagram": {
        const { InstagramPostingAdapter } = await import("../posting/instagram-posting-adapter");
        adapter = new InstagramPostingAdapter(authService as any);
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

      case "wordpress": {
        const { WordPressPostingAdapter } = await import("../posting/wordpress-posting-adapter");
        adapter = new WordPressPostingAdapter(authService as any);
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
  ): Promise<PlatformOAuthService> {
    const cacheKey = `${platform}-${userId}`;

    if (this.authServices.has(cacheKey)) {
      return this.authServices.get(cacheKey)!;
    }

    // Filter out non-social platforms
    if (platform === "website" || platform === "telegram") {
      throw new Error(`Platform ${platform} does not support social auth posting`);
    }

    // Get auth data from database
    const { SocialAuthRepository } = await import("@/infrastructure/repositories/social/social-auth-repo");
    const { ObjectId } = await import("mongodb");

    const repo = new SocialAuthRepository();
    const auth = await repo.getByUserAndPlatform(new ObjectId(userId), platform as SocialPlatform);

    if (!auth) {
      throw new Error(`${platform} account not connected for user ${userId}`);
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

      case "instagram": {
        const { InstagramAuthService } = await import("../auth/instagram-auth-service");
        authService = new InstagramAuthService({
          appId: process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID || "",
          appSecret: process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET || "",
          pageId: auth.openId,
          instagramBusinessAccountId: auth.openId,
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

      case "youtube": {
        const { YouTubeAuthService } = await import("../auth/youtube-auth-service");
        authService = new YouTubeAuthService({
          apiKey: process.env.YOUTUBE_API_KEY || "",
          clientId: process.env.YOUTUBE_CLIENT_ID || "",
          clientSecret: process.env.YOUTUBE_CLIENT_SECRET || "",
          refreshToken: auth.refreshToken,
          accessToken: auth.accessToken,
          expiresAt: auth.expiresAt,
        });
        break;
      }

      case "wordpress": {
        const { WordPressAuthService } = await import("../auth/wordpress-auth-service");
        authService = new WordPressAuthService({
          siteUrl: auth.pageName,
          blogId: auth.openId,
          accessToken: auth.accessToken,
          expiresAt: auth.expiresAt,
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
    this.postingAdapters.clear();
  }

  clearUserCache(platform: Platform, userId: string): void {
    const cacheKey = `${platform}-${userId}`;
    this.authServices.delete(cacheKey);
    this.postingAdapters.delete(cacheKey);
  }

  getSupportedPlatforms(): Platform[] {
    return ["facebook", "instagram", "tiktok", "zalo", "youtube", "wordpress"];
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
