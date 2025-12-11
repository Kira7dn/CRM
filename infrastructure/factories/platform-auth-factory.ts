import { WordPressAuthService, type WordPressPlatformConfig } from "@/infrastructure/adapters/external/social/auth/wordpress-auth-service";
import type { PlatformAuthService, PlatformAuthConfig } from "@/core/application/interfaces/social/auth-service";
import type { SocialPlatform } from "@/core/domain/social/social-auth";

/**
 * Platform Authentication Factory
 * Creates authentication service instances for different social platforms
 */

export interface CreateAuthServiceConfig extends PlatformAuthConfig {
  platform: SocialPlatform;
  siteUrl?: string; // For WordPress
  tokenType?: "wpcom" | "self-host"; // For WordPress
  siteId?: string; // For WordPress.com
  refreshToken?: string; // For platforms that support refresh tokens
}

export function createAuthService(config: CreateAuthServiceConfig): PlatformAuthService {
  switch (config.platform) {
    case "wordpress":
      return new WordPressAuthService(config as WordPressPlatformConfig);

    // TODO: Add other platforms
    // case "facebook":
    //   return new FacebookAuthService(config);
    // case "tiktok":
    //   return new TikTokAuthService(config);
    // case "youtube":
    //   return new YouTubeAuthService(config);
    // case "zalo":
    //   return new ZaloAuthService(config);

    default:
      throw new Error(`Unsupported platform: ${config.platform}`);
  }
}
