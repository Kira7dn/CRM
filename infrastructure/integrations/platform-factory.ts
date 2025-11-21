import type { Platform } from "@/core/domain/managements/post";
import type {
  PlatformIntegrationService,
  PlatformIntegrationFactory,
} from "@/core/application/interfaces/platform-integration-service";
import { createFacebookIntegration } from "./facebook-integration";
import { createTikTokIntegration } from "./tiktok-integration";
import { createZaloIntegration } from "./zalo-integration";
import { createYouTubeIntegration } from "./youtube-integration";

/**
 * Platform Integration Factory
 * Creates platform-specific integration services
 */
export class PlatformFactory implements PlatformIntegrationFactory {
  private instances: Map<Platform, PlatformIntegrationService> = new Map();

  /**
   * Create or get cached platform integration service
   */
  async create(platform: Platform): Promise<PlatformIntegrationService> {
    // Return cached instance if exists
    if (this.instances.has(platform)) {
      return this.instances.get(platform)!;
    }

    // Create new instance based on platform
    let service: PlatformIntegrationService;

    switch (platform) {
      case "facebook":
        service = createFacebookIntegration();
        break;
      case "tiktok":
        service = createTikTokIntegration();
        break;
      case "zalo":
        service = createZaloIntegration();
        break;
      case "youtube":
        service = await createYouTubeIntegration();
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    // Cache instance
    this.instances.set(platform, service);
    return service;
  }

  /**
   * Clear all cached instances
   */
  clearCache(): void {
    this.instances.clear();
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
