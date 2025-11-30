/**
 * Social Integration Services
 * Export all social integrations (unified posting + messaging) and factories
 */

// Unified Social Integration
export type { SocialIntegration } from "./social-integration";
export { BaseSocialIntegration } from "./social-integration";
export { SocialIntegrationFactory, getSocialIntegrationFactory } from "./social-integration-factory";

// Platform-specific integrations
export { FacebookIntegration, createFacebookIntegration, createFacebookIntegrationForUser } from "./facebook-integration";
export { TikTokIntegration, createTikTokIntegration, createTikTokIntegrationForUser } from "./tiktok-integration";
export { ZaloIntegration, createZaloIntegration } from "./zalo-integration";
export { YouTubeIntegration, createYouTubeIntegration, createYouTubeIntegrationForUser } from "./youtube-integration";

// Legacy Platform Factory (for backward compatibility)
export { PlatformFactory, getPlatformFactory } from "./platform-factory";

// Configuration types
export type { FacebookConfig } from "./facebook-integration";
export type { TikTokConfig } from "./tiktok-integration";
export type { ZaloConfig } from "./zalo-integration";
export type { YouTubeConfig } from "./youtube-integration";
