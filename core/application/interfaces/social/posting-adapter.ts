import type { Platform, PostMetrics, PostMedia } from "@/core/domain/marketing/post";

/**
 * Request payload for publishing content
 */
export interface PostingPublishRequest {
  title: string;
  body?: string;
  media: PostMedia[];
  hashtags: string[];
  mentions: string[];
  scheduledAt?: Date;
}

/**
 * Response from publishing operation
 */
export interface PostingPublishResponse {
  success: boolean;
  postId?: string;
  permalink?: string;
  error?: string;
}

/**
 * Posting Service Interface
 * Defines contract for publishing content to social platforms
 */
export interface PostingService {
  platform: Platform;

  /**
   * Publish new content to platform
   */
  publish(request: PostingPublishRequest): Promise<PostingPublishResponse>;

  /**
   * Update existing post on platform
   */
  update(postId: string, request: PostingPublishRequest): Promise<PostingPublishResponse>;

  /**
   * Delete post from platform
   */
  delete(postId: string): Promise<boolean>;

  /**
   * Get engagement metrics for a post
   */
  getMetrics(postId: string): Promise<PostMetrics>;

  /**
   * Verify authentication/access token
   */
  verifyAuth(): Promise<boolean>;
}

/**
 * Posting Adapter Factory Interface
 * Creates posting adapters for different platforms
 */
export interface PostingAdapterFactory {
  create(platform: Platform, userId: string): Promise<PostingService>;
  clearCache(): void;
  clearUserCache(platform: Platform, userId: string): void;
  getSupportedPlatforms(): Platform[];
  isSupported(platform: Platform): boolean;
}
