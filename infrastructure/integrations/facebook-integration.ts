import type {
  FacebookIntegrationService,
  PlatformPublishRequest,
  PlatformPublishResponse,
} from "@/core/application/interfaces/platform-integration-service";
import type { PostMetrics, PostMedia } from "@/core/domain/managements/post";

/**
 * Facebook Graph API Configuration
 */
export interface FacebookConfig {
  appId: string;
  appSecret: string;
  pageId: string;
  pageAccessToken: string; // Long-lived page access token
}

/**
 * Facebook Graph API Response Types
 */
interface FacebookPostResponse {
  id: string;
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

interface FacebookInsightsResponse {
  data: Array<{
    name: string;
    values: Array<{
      value: number;
    }>;
  }>;
}

/**
 * Facebook Graph API Integration Service
 * Implements posting to Facebook Pages
 *
 * Required Permissions:
 * - pages_read_engagement
 * - pages_manage_posts
 * - pages_read_user_content
 *
 * API Documentation: https://developers.facebook.com/docs/graph-api
 */
export class FacebookIntegration implements FacebookIntegrationService {
  platform = "facebook" as const;
  private baseUrl = "https://graph.facebook.com/v19.0";

  constructor(private config: FacebookConfig) { }

  /**
   * Publish content to Facebook Page
   */
  async publish(request: PlatformPublishRequest): Promise<PlatformPublishResponse> {
    try {
      // Validate request
      if (!request.title && !request.body) {
        return {
          success: false,
          error: "Title or body is required for Facebook post",
        };
      }

      // Prepare message
      const message = this.formatMessage(request);

      // Handle different media types
      if (request.media.length > 0) {
        return await this.publishWithMedia(message, request.media);
      } else {
        return await this.publishTextPost(message);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update existing Facebook post
   * Note: Facebook only allows updating the message of a post
   */
  async update(postId: string, request: PlatformPublishRequest): Promise<PlatformPublishResponse> {
    try {
      const message = this.formatMessage(request);

      const url = `${this.baseUrl}/${postId}`;
      const params = new URLSearchParams({
        message,
        access_token: this.config.pageAccessToken,
      });

      const response = await fetch(url, {
        method: "POST",
        body: params,
      });

      const data = await response.json();

      if (data.error) {
        return {
          success: false,
          error: data.error.message,
        };
      }

      return {
        success: true,
        postId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete Facebook post
   */
  async delete(postId: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/${postId}`;
      const params = new URLSearchParams({
        access_token: this.config.pageAccessToken,
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        method: "DELETE",
      });

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error("Failed to delete Facebook post:", error);
      return false;
    }
  }

  /**
   * Get metrics for a Facebook post
   */
  async getMetrics(postId: string): Promise<PostMetrics> {
    try {
      const url = `${this.baseUrl}/${postId}`;
      const params = new URLSearchParams({
        fields: "reactions.summary(true),shares,comments.summary(true)",
        access_token: this.config.pageAccessToken,
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();

      // Get insights for views and reach
      const insightsUrl = `${this.baseUrl}/${postId}/insights`;
      const insightsParams = new URLSearchParams({
        metric: "post_impressions,post_impressions_unique,post_engaged_users",
        access_token: this.config.pageAccessToken,
      });

      const insightsResponse = await fetch(`${insightsUrl}?${insightsParams.toString()}`);
      const insightsData: FacebookInsightsResponse = await insightsResponse.json();

      const metrics: PostMetrics = {
        likes: data.reactions?.summary?.total_count || 0,
        comments: data.comments?.summary?.total_count || 0,
        shares: data.shares?.count || 0,
        views: 0,
        reach: 0,
        engagement: 0,
        lastSyncedAt: new Date(),
      };

      // Parse insights data
      if (insightsData.data) {
        insightsData.data.forEach((metric) => {
          const value = metric.values[0]?.value || 0;
          switch (metric.name) {
            case "post_impressions":
              metrics.views = value;
              break;
            case "post_impressions_unique":
              metrics.reach = value;
              break;
            case "post_engaged_users":
              metrics.engagement = value;
              break;
          }
        });
      }

      return metrics;
    } catch (error) {
      console.error("Failed to get Facebook metrics:", error);
      return {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        reach: 0,
        engagement: 0,
        lastSyncedAt: new Date(),
      };
    }
  }

  /**
   * Verify Facebook authentication
   */
  async verifyAuth(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/me`;
      const params = new URLSearchParams({
        access_token: this.config.pageAccessToken,
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();

      return !data.error;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get page access token from user access token
   */
  async getPageAccessToken(pageId: string): Promise<string> {
    try {
      const url = `${this.baseUrl}/${pageId}`;
      const params = new URLSearchParams({
        fields: "access_token",
        access_token: this.config.pageAccessToken,
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      return data.access_token;
    } catch (error) {
      throw new Error(`Failed to get page access token: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Upload media to Facebook
   */
  async uploadMedia(media: PostMedia): Promise<string> {
    try {
      const url = `${this.baseUrl}/${this.config.pageId}/photos`;
      const params = new URLSearchParams({
        url: media.url,
        published: "false", // Upload unpublished for later use
        access_token: this.config.pageAccessToken,
      });

      const response = await fetch(url, {
        method: "POST",
        body: params,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      return data.id;
    } catch (error) {
      throw new Error(`Failed to upload media: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Publish text-only post
   */
  private async publishTextPost(message: string): Promise<PlatformPublishResponse> {
    const url = `${this.baseUrl}/${this.config.pageId}/feed`;
    const params = new URLSearchParams({
      message,
      access_token: this.config.pageAccessToken,
    });

    const response = await fetch(url, {
      method: "POST",
      body: params,
    });

    const data: FacebookPostResponse = await response.json();

    if (data.error) {
      return {
        success: false,
        error: data.error.message,
      };
    }

    return {
      success: true,
      postId: data.id,
      permalink: `https://facebook.com/${data.id}`,
    };
  }

  /**
   * Publish post with media (photo/video)
   */
  private async publishWithMedia(message: string, media: PostMedia[]): Promise<PlatformPublishResponse> {
    try {
      const firstMedia = media[0];

      if (media.length === 1 && firstMedia.type === "image") {
        // Single photo
        return await this.publishPhoto(message, firstMedia.url);
      } else if (media.length === 1 && firstMedia.type === "video") {
        // Single video
        return await this.publishVideo(message, firstMedia.url);
      } else if (media.length > 1) {
        // Multiple photos (carousel)
        return await this.publishCarousel(message, media);
      }

      return {
        success: false,
        error: "Unsupported media configuration",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Publish single photo
   */
  private async publishPhoto(message: string, photoUrl: string): Promise<PlatformPublishResponse> {
    const url = `${this.baseUrl}/${this.config.pageId}/photos`;
    const params = new URLSearchParams({
      url: photoUrl,
      message,
      access_token: this.config.pageAccessToken,
    });

    const response = await fetch(url, {
      method: "POST",
      body: params,
    });

    const data: FacebookPostResponse = await response.json();

    if (data.error) {
      return {
        success: false,
        error: data.error.message,
      };
    }

    return {
      success: true,
      postId: data.id,
      permalink: `https://facebook.com/${data.id}`,
    };
  }

  /**
   * Publish video
   */
  private async publishVideo(message: string, videoUrl: string): Promise<PlatformPublishResponse> {
    const url = `${this.baseUrl}/${this.config.pageId}/videos`;
    const params = new URLSearchParams({
      file_url: videoUrl,
      description: message,
      access_token: this.config.pageAccessToken,
    });

    const response = await fetch(url, {
      method: "POST",
      body: params,
    });

    const data: FacebookPostResponse = await response.json();

    if (data.error) {
      return {
        success: false,
        error: data.error.message,
      };
    }

    return {
      success: true,
      postId: data.id,
      permalink: `https://facebook.com/${data.id}`,
    };
  }

  /**
   * Publish carousel (multiple photos)
   */
  private async publishCarousel(message: string, media: PostMedia[]): Promise<PlatformPublishResponse> {
    try {
      // Upload all photos first (unpublished)
      const uploadedPhotoIds: string[] = [];

      for (const item of media) {
        if (item.type === "image") {
          const photoId = await this.uploadMedia(item);
          uploadedPhotoIds.push(photoId);
        }
      }

      // Create album post with all photos
      const url = `${this.baseUrl}/${this.config.pageId}/feed`;
      const params = new URLSearchParams({
        message,
        attached_media: JSON.stringify(uploadedPhotoIds.map((id) => ({ media_fbid: id }))),
        access_token: this.config.pageAccessToken,
      });

      const response = await fetch(url, {
        method: "POST",
        body: params,
      });

      const data: FacebookPostResponse = await response.json();

      if (data.error) {
        return {
          success: false,
          error: data.error.message,
        };
      }

      return {
        success: true,
        postId: data.id,
        permalink: `https://facebook.com/${data.id}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Format message with hashtags and mentions
   */
  private formatMessage(request: PlatformPublishRequest): string {
    let message = request.title;
    if (request.body) {
      message += `\n\n${request.body}`;
    }

    if (request.hashtags.length > 0) {
      message += "\n\n" + request.hashtags.map((tag) => `#${tag}`).join(" ");
    }

    if (request.mentions.length > 0) {
      message += "\n" + request.mentions.map((mention) => `@${mention}`).join(" ");
    }

    return message;
  }
}

/**
 * Factory function to create FacebookIntegration
 */
export function createFacebookIntegration(): FacebookIntegration {
  const config: FacebookConfig = {
    appId: process.env.FACEBOOK_APP_ID || "",
    appSecret: process.env.FACEBOOK_APP_SECRET || "",
    pageId: process.env.FACEBOOK_PAGE_ID || "",
    pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "",
  };

  if (!config.appId || !config.appSecret || !config.pageId || !config.pageAccessToken) {
    throw new Error("Missing Facebook configuration. Please set FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FACEBOOK_PAGE_ID, and FACEBOOK_PAGE_ACCESS_TOKEN environment variables.");
  }

  return new FacebookIntegration(config);
}
