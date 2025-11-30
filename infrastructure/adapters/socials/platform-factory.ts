import type { Platform } from "@/core/domain/campaigns/post";
import type {
  PlatformIntegrationService,
  PlatformIntegrationFactory,
} from "@/core/application/interfaces/platform-integration-service";
import { createFacebookIntegrationForUser } from "./facebook-integration";
import { createTikTokIntegrationForUser } from "./tiktok-integration";
import { createZaloIntegration } from "./zalo-integration";
import { createYouTubeIntegrationForUser } from "./youtube-integration";

/**
 * Platform Integration Factory
 * Creates platform-specific integration services with user authentication
 */
export class PlatformFactory implements PlatformIntegrationFactory {
  // Cache key: `${platform}-${userId}`
  private instances: Map<string, PlatformIntegrationService> = new Map();

  /**
   * Create or get cached platform integration service
   * @param platform - Platform to create service for
   * @param userId - User ID for user-specific integrations (required for all platforms)
   */
  async create(
    platform: Platform,
    userId: string
  ): Promise<PlatformIntegrationService> {
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
    let service: PlatformIntegrationService;

    switch (platform) {
      case "facebook":
        service = await createFacebookIntegrationForUser(userId);
        break;
      case "tiktok":
        service = await createTikTokIntegrationForUser(userId);
        break;
      case "zalo":
        service = await createZaloIntegration();
        break;
      case "youtube":
        service = await createYouTubeIntegrationForUser(userId);
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    // Cache instance per user
    this.instances.set(cacheKey, service);
    return service;
  }

  /**
   * Clear all cached instances
   */
  clearCache(): void {
    this.instances.clear();
  }

  /**
   * Clear cached instance for specific user and platform
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
}

/**
 * Singleton instance
 */
let platformFactory: PlatformFactory | null = null;

/**
 * Get platform factory instance
 */
export function getPlatformFactory(): PlatformFactory {
  if (!platformFactory) {
    platformFactory = new PlatformFactory();
  }
  return platformFactory;
}
