/**
 * Social Integration Adapters
 * Exports new architecture with separated Auth, Posting, and Messaging adapters
 */

// ========== Posting Adapters (Interfaces from Application Layer) ==========
export type { PostingPublishRequest, PostingPublishResponse } from "@/core/application/interfaces/marketing/posting-adapter";
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

export type { MessagingAdapterFactory } from "@/core/application/interfaces/messaging/messaging-adapter";
export { PlatformMessagingAdapterFactory, getMessagingAdapterFactory } from "./factories/messaging-adapter-factory";
