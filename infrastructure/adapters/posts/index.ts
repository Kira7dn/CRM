/**
 * Platform Integration Services
 * Export all platform integrations and factory
 */

export { FacebookIntegration, createFacebookIntegration } from "./facebook-integration";
export { TikTokIntegration, createTikTokIntegration } from "./tiktok-integration";
export { ZaloIntegration, createZaloIntegration } from "./zalo-integration";
export { YouTubeIntegration, createYouTubeIntegration } from "./youtube-integration";
export { PlatformFactory, getPlatformFactory } from "./platform-factory";

export type { FacebookConfig } from "./facebook-integration";
export type { TikTokConfig } from "./tiktok-integration";
export type { ZaloConfig } from "./zalo-integration";
export type { YouTubeConfig } from "./youtube-integration";
