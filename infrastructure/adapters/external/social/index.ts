/**
 * Social Integration Adapters
 * Exports new architecture with separated Auth, Posting, and Messaging adapters
 */

// ========== Auth Services (Interfaces from Application Layer) ==========
export { BasePlatformOAuthService } from "./auth/utils/base-auth-service";

export type { FacebookAuthConfig } from "./auth/facebook-auth-service";
export { FacebookAuthService } from "./auth/facebook-auth-service";

export type { TikTokAuthConfig } from "./auth/tiktok-auth-service";
export { TikTokAuthService } from "./auth/tiktok-auth-service";

export type { YouTubeAuthConfig } from "./auth/youtube-auth-service";
export { YouTubeAuthService } from "./auth/youtube-auth-service";

export type { ZaloAuthConfig } from "./auth/zalo-auth-service";
export { ZaloAuthService } from "./auth/zalo-auth-service";

// Token refresh helpers
export { refreshYouTubeToken, refreshTikTokToken, refreshFacebookToken } from "./auth/utils/token-refresh-helpers";

// ========== Posting Adapters (Interfaces from Application Layer) ==========
export type { PostingService, PostingPublishRequest, PostingPublishResponse } from "@/core/application/interfaces/marketing/posting-adapter";
export { BasePostingAdapter } from "./posting/base-posting-service";

export { FacebookPostingAdapter } from "./posting/facebook-posting-adapter";
export { TikTokPostingAdapter } from "./posting/tiktok-posting-adapter";
export { YouTubePostingAdapter } from "./posting/youtube-posting-adapter";
export { ZaloPostingAdapter } from "./posting/zalo-posting-adapter";

// ========== Messaging Adapters (Interfaces from Application Layer) ==========
export type { MessagingService } from "@/core/application/interfaces/messaging/messaging-adapter";
export { BaseMessagingAdapter } from "./messaging/messaging-service";

export { FacebookMessagingAdapter } from "./messaging/facebook-messaging-adapter";
export { TikTokMessagingAdapter } from "./messaging/tiktok-messaging-adapter";
export { ZaloMessagingAdapter } from "./messaging/zalo-messaging-adapter";

// ========== Factories (Interfaces from Application Layer) ==========
export type { PostingAdapterFactory } from "@/core/application/interfaces/marketing/posting-adapter";
export { PlatformPostingAdapterFactory, getPostingAdapterFactory } from "./factories/posting-adapter-factory";

export type { MessagingAdapterFactory } from "@/core/application/interfaces/messaging/messaging-adapter";
export { PlatformMessagingAdapterFactory, getMessagingAdapterFactory } from "./factories/messaging-adapter-factory";
