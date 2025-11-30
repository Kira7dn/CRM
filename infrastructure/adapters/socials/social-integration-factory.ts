import type { Platform } from "@/core/domain/campaigns/post";
import type { SocialIntegration } from "./social-integration";
import type { PlatformIntegrationFactory } from "@/core/application/interfaces/platform-integration-service";

/**
 * Social Integration Factory
 *
 * Unified factory pattern to create social integration instances that support
 * both content publishing (posts) and customer messaging.
 *
 * This factory replaces the separate PlatformFactory (for posts) and
 * MessagingGatewayFactory (for messages) with a single unified factory.
 *
 * Usage:
 * ```typescript
 * const factory = getSocialIntegrationFactory();
 * const facebook = await factory.create("facebook", userId);
 *
 * // Use for posting
 * await facebook.publish({ title: "Hello", body: "World", ... });
 *
 * // Use for messaging
 * await facebook.sendMessage(platformUserId, "Hi there!");
 * ```
 */
export class SocialIntegrationFactory implements PlatformIntegrationFactory {
  // Cache key: `${platform}-${userId}`
  private instances: Map<string, SocialIntegration> = new Map();

  /**
   * Create or get cached social integration instance
   *
   * @param platform - Platform to create integration for (facebook, tiktok, zalo, youtube)
   * @param userId - User ID for user-specific integrations (required for all platforms)
   * @param options - Optional platform-specific parameters (pageId, channelId, etc.)
   * @returns SocialIntegration instance with both posting and messaging capabilities
   */
  async create(
    platform: Platform,
    userId: string,
    options?: { pageId?: string; channelId?: string }
  ): Promise<SocialIntegration> {
    // Validate userId
    if (!userId) {
      throw new Error(`User ID is required for ${platform} integration`);
    }

    // Create cache key with userId to ensure per-user instances
    const cacheKey = `${platform}-${userId}`;

    // Return cached instance if exists
    if (this.instances.has(cacheKey)) {
      return this.instances.get(cacheKey)!;
    }

    // Create new instance based on platform
    let integration: SocialIntegration;

    switch (platform) {
      case "facebook":
        // Import dynamically to avoid circular dependencies
        const { createFacebookIntegrationForUser } = await import("./facebook-integration");
        integration = await createFacebookIntegrationForUser(userId);
        break;

      case "tiktok":
        const { createTikTokIntegrationForUser } = await import("./tiktok-integration");
        integration = await createTikTokIntegrationForUser(userId);
        break;

      case "zalo":
        const { createZaloIntegration } = await import("./zalo-integration");
        integration = await createZaloIntegration();
        break;

      case "youtube":
        const { createYouTubeIntegrationForUser } = await import("./youtube-integration");
        integration = await createYouTubeIntegrationForUser(userId);
        break;

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    // Cache instance per user
    this.instances.set(cacheKey, integration);
    return integration;
  }

  /**
   * Create integration using system credentials (for messaging without user context)
   * Currently only used for messaging on some platforms
   *
   * @param platform - Platform to create integration for
   * @returns SocialIntegration instance
   */
  async createForMessaging(platform: Platform): Promise<SocialIntegration> {
    const cacheKey = `${platform}-messaging`;

    // Return cached instance if exists
    if (this.instances.has(cacheKey)) {
      return this.instances.get(cacheKey)!;
    }

    let integration: SocialIntegration;

    switch (platform) {
      case "facebook":
        const { createFacebookIntegration } = await import("./facebook-integration");
        const fbToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
        const fbPageId = process.env.FACEBOOK_PAGE_ID;
        if (!fbToken) {
          throw new Error("FACEBOOK_PAGE_ACCESS_TOKEN environment variable not set");
        }
        integration = createFacebookIntegration(fbToken, fbPageId) as SocialIntegration;
        break;

      case "tiktok":
        const { createTikTokIntegration } = await import("./tiktok-integration");
        const ttToken = process.env.TIKTOK_ACCESS_TOKEN;
        if (!ttToken) {
          throw new Error("TIKTOK_ACCESS_TOKEN environment variable not set");
        }
        integration = createTikTokIntegration(ttToken) as SocialIntegration;
        break;

      case "zalo":
        const { createZaloIntegration } = await import("./zalo-integration");
        integration = await createZaloIntegration();
        break;

      case "youtube":
        throw new Error("YouTube does not support messaging");

      case "website":
      case "telegram":
        throw new Error(`${platform} messaging not yet implemented`);

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    this.instances.set(cacheKey, integration);
    return integration;
  }

  /**
   * Clear all cached instances
   */
  clearCache(): void {
    this.instances.clear();
  }

  /**
   * Clear cached instance for specific user and platform
   *
   * @param platform - Platform to clear
   * @param userId - User ID
   */
  clearUserCache(platform: Platform, userId: string): void {
    const cacheKey = `${platform}-${userId}`;
    this.instances.delete(cacheKey);
  }

  /**
   * Get all supported platforms
   */
  getSupportedPlatforms(): Platform[] {
    return ["facebook", "tiktok", "zalo", "youtube"];
  }

  /**
   * Check if a platform is supported
   *
   * @param platform - The platform to check
   * @returns true if platform is supported, false otherwise
   */
  isSupported(platform: Platform): boolean {
    return this.getSupportedPlatforms().includes(platform);
  }
}

/**
 * Singleton instance
 */
let socialIntegrationFactory: SocialIntegrationFactory | null = null;

/**
 * Get social integration factory instance (singleton)
 */
export function getSocialIntegrationFactory(): SocialIntegrationFactory {
  if (!socialIntegrationFactory) {
    socialIntegrationFactory = new SocialIntegrationFactory();
  }
  return socialIntegrationFactory;
}
