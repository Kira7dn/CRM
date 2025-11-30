import type { Platform, PlatformMetadata, PostMedia, PostMetrics } from "@/core/domain/campaigns/post";

/**
 * Common interface for publishing posts to external platforms
 */
export interface PlatformPublishRequest {
  title: string;
  body?: string;
  media: PostMedia[];
  hashtags: string[];
  mentions: string[];
  scheduledAt?: Date;
}

/**
 * Response from platform after publishing
 */
export interface PlatformPublishResponse {
  success: boolean;
  postId?: string;
  permalink?: string;
  error?: string;
}

/**
 * Base interface for all platform integrations
 */
export interface PlatformIntegrationService {
  platform: Platform;

  /**
   * Publish content to the platform
   */
  publish(request: PlatformPublishRequest): Promise<PlatformPublishResponse>;

  /**
   * Update existing post on the platform
   */
  update(postId: string, request: PlatformPublishRequest): Promise<PlatformPublishResponse>;

  /**
   * Delete post from the platform
   */
  delete(postId: string): Promise<boolean>;

  /**
   * Get metrics for a post
   */
  getMetrics(postId: string): Promise<PostMetrics>;

  /**
   * Verify authentication/access token
   */
  verifyAuth(): Promise<boolean>;
}

/**
 * Facebook Graph API integration
 */
export interface FacebookIntegrationService extends PlatformIntegrationService {
  platform: "facebook";

  /**
   * Get Facebook page access token
   */
  getPageAccessToken(pageId: string): Promise<string>;

  /**
   * Upload media to Facebook
   */
  uploadMedia(media: PostMedia): Promise<string>;
}

/**
 * TikTok API integration
 */
export interface TikTokIntegrationService extends PlatformIntegrationService {
  platform: "tiktok";

  /**
   * Upload video to TikTok
   */
  uploadVideo(media: PostMedia): Promise<string>;

  /**
   * Get video upload status
   */
  getUploadStatus(uploadId: string): Promise<"processing" | "ready" | "failed">;
}

/**
 * Zalo OA (Official Account) API integration
 */
export interface ZaloIntegrationService extends PlatformIntegrationService {
  platform: "zalo";

  /**
   * Upload attachment to Zalo
   */
  uploadAttachment(media: PostMedia): Promise<string>;

  /**
   * Send broadcast message to Zalo followers
   * For direct messaging, use the messaging methods from SocialIntegration
   */
  broadcastMessage(message: string, mediaId?: string): Promise<PlatformPublishResponse>;
}

/**
 * YouTube Data API integration
 */
export interface YouTubeIntegrationService extends PlatformIntegrationService {
  platform: "youtube";

  /**
   * Initialize the YouTube integration by obtaining an access token
   * @throws {Error} If initialization fails
   */
  initialize(): Promise<void>;

  /**
   * Upload video to YouTube
   */
  uploadVideo(media: PostMedia, title: string, description?: string): Promise<string>;

  /**
   * Get video processing status
   */
  getVideoStatus(videoId: string): Promise<"processing" | "ready" | "failed">;

  /**
   * Add video to playlist
   */
  addToPlaylist(videoId: string, playlistId: string): Promise<boolean>;
}

/**
 * Factory for creating platform integration services
 */
export interface PlatformIntegrationFactory {
  /**
   * Create platform integration service for a specific user
   * @param platform - Platform to create service for
   * @param userId - User ID for user-specific integrations (required for all platforms)
   * @param options - Optional platform-specific parameters (pageId, channelId, etc.)
   */
  create(
    platform: Platform,
    userId: string,
    options?: { pageId?: string; channelId?: string }
  ): Promise<PlatformIntegrationService>;
}
