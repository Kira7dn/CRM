/**
 * Platform types for social media marketing
 * Note: "website" and "telegram" are messaging-only platforms
 * Note: "wordpress" for blog post publishing
 */
export type Platform = "facebook" | "youtube" | "tiktok" | "zalo" | "website" | "telegram" | "wordpress";

/**
 * Content types based on platform capabilities
 */
export type ContentType =
  | "reel"        // Facebook Reels, YouTube Shorts, TikTok Video
  | "short"       // Alias cho reel
  | "post"        // Photo post / feed / broadcast photo
  | "video"       // Long video (>60s)
  | "article"     // Article / long text post
  | "story";      // Story post

/**
 * Post status for scheduling and publishing
 */
export type PostStatus = "draft" | "scheduled" | "published" | "failed" | "archived";

/**
 * Media attachment for posts
 */
export interface PostMedia {
  type: "image" | "video" | "carousel";
  url: string;
  thumbnailUrl?: string;
  duration?: number; // For videos, in seconds
  order?: number;    // For carousel/multiple images
}

/**
 * Platform-specific metadata
 */
export interface PlatformMetadata {
  platform: Platform;
  postId?: string;       // External platform post ID after publishing
  permalink?: string;    // URL to the published post
  publishedAt?: Date;
  status: PostStatus;
  error?: string;        // Error message if failed
  scheduledJobId?: string; // Queue job ID for scheduled posts
}

/**
 * Engagement metrics
 */
export interface PostMetrics {
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  reach?: number;
  engagement?: number;
  lastSyncedAt?: Date;
}

/**
 * Post domain entity for multi-platform social media marketing
 */
export class Post {
  constructor(
    public readonly id: string,
    public title: string,
    public body: string | undefined,
    public contentType: ContentType,
    public platforms: PlatformMetadata[],
    public media: PostMedia[],
    public scheduledAt: Date | undefined,
    public hashtags: string[],
    public mentions: string[],
    public campaignId: string | undefined,
    public metrics: PostMetrics,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) { }
}

/**
 * Validation function for Post entity
 */
export function validatePost(data: Partial<Post>): string[] {
  const errors: string[] = []

  if (!data.title || data.title.trim().length === 0) {
    errors.push("Post title is required")
  }

  if (data.title && data.title.length > 500) {
    errors.push("Post title must not exceed 500 characters")
  }

  if (!data.contentType) {
    errors.push("Content type is required")
  }

  const validContentTypes: ContentType[] = [
    "reel",
    "short",
    "post",
    "video",
    "article",
    "story",
  ]
  if (data.contentType && !validContentTypes.includes(data.contentType)) {
    errors.push(`Invalid content type. Must be one of: ${validContentTypes.join(", ")}`)
  }

  if (!data.platforms || data.platforms.length === 0) {
    errors.push("At least one platform is required")
  }

  if (data.platforms) {
    const validPlatforms: Platform[] = ["facebook", "youtube", "tiktok", "zalo"]
    data.platforms.forEach((pm, index) => {
      if (!validPlatforms.includes(pm.platform)) {
        errors.push(`Invalid platform at index ${index}. Must be one of: ${validPlatforms.join(", ")}`)
      }
    })
  }

  if (data.scheduledAt && data.scheduledAt < new Date()) {
    errors.push("Scheduled date must be in the future")
  }

  if (data.hashtags && data.hashtags.length > 30) {
    errors.push("Maximum 30 hashtags allowed")
  }

  return errors
}
