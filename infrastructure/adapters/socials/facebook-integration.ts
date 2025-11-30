import type {
  FacebookIntegrationService,
  PlatformPublishRequest,
  PlatformPublishResponse,
} from "@/core/application/interfaces/platform-integration-service";
import type { PostMetrics, PostMedia } from "@/core/domain/campaigns/post";
import type { Message } from "@/core/domain/messaging/message";
import { BaseSocialIntegration } from "./social-integration";

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
 * Implements both posting to Facebook Pages and Messenger messaging
 *
 * Required Permissions:
 * - pages_read_engagement
 * - pages_manage_posts
 * - pages_read_user_content
 * - pages_messaging (for Messenger)
 *
 * API Documentation:
 * - Posts: https://developers.facebook.com/docs/graph-api
 * - Messenger: https://developers.facebook.com/docs/messenger-platform
 */
export class FacebookIntegration extends BaseSocialIntegration implements FacebookIntegrationService {
  platform = "facebook" as const;
  private baseUrl = "https://graph.facebook.com/v19.0";

  constructor(private config: FacebookConfig) {
    super();
    if (!this.config.pageAccessToken) {
      console.warn("[FacebookIntegration] Page access token not configured");
    }
  }

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
   * Override base class to add mentions support
   */
  protected formatMessage(request: PlatformPublishRequest): string {
    let message = super.formatMessage(request);

    if (request.mentions && request.mentions.length > 0) {
      message += "\n" + request.mentions.map((mention) => `@${mention}`).join(" ");
    }

    return message;
  }

  // ========== Messaging Methods (Messenger Platform) ==========

  /**
   * Send a text message to a user via Facebook Messenger
   */
  async sendMessage(platformUserId: string, content: string): Promise<void> {
    this.validateParams({ platformUserId, content });

    const payload = {
      recipient: {
        id: platformUserId,
      },
      message: {
        text: content,
      },
    };

    await this.sendToMessenger(payload);
  }

  /**
   * Send a message with attachments to a user
   */
  async sendMessageWithAttachments(
    platformUserId: string,
    content: string,
    attachments: Array<{
      type: "image" | "file" | "video" | "audio";
      url: string;
    }>
  ): Promise<void> {
    this.validateParams({ platformUserId });

    // Facebook requires separate API calls for text and attachments
    // Send text first if provided
    if (content && content.trim().length > 0) {
      await this.sendMessage(platformUserId, content);
    }

    // Send each attachment separately
    for (const attachment of attachments) {
      const payload = {
        recipient: {
          id: platformUserId,
        },
        message: {
          attachment: {
            type: this.mapAttachmentType(attachment.type),
            payload: {
              url: attachment.url,
              is_reusable: true,
            },
          },
        },
      };

      await this.sendToMessenger(payload);
    }
  }

  /**
   * Fetch message history (not directly supported by Facebook API)
   * Facebook doesn't provide a direct API to fetch user message history
   * You would need to store messages as they come through webhooks
   */
  async fetchHistory(platformUserId: string, limit: number = 50): Promise<Message[]> {
    this.log("fetchHistory not supported by Facebook Messenger Platform", {
      platformUserId,
      limit,
    });
    throw new Error(
      "fetchHistory is not supported by Facebook Messenger Platform. Messages should be stored via webhooks."
    );
  }

  /**
   * Send typing indicator to user
   */
  async sendTypingIndicator(platformUserId: string, typing: boolean): Promise<void> {
    this.validateParams({ platformUserId });

    const payload = {
      recipient: {
        id: platformUserId,
      },
      sender_action: typing ? "typing_on" : "typing_off",
    };

    await this.sendToMessenger(payload);
  }

  /**
   * Mark message as read
   */
  async markAsRead(platformUserId: string): Promise<void> {
    this.validateParams({ platformUserId });

    const payload = {
      recipient: {
        id: platformUserId,
      },
      sender_action: "mark_seen",
    };

    await this.sendToMessenger(payload);
  }

  /**
   * Send payload to Facebook Messenger Send API
   */
  private async sendToMessenger(payload: any): Promise<void> {
    try {
      this.log("Sending message to Facebook Messenger", payload);

      const url = `${this.baseUrl}/me/messages?access_token=${this.config.pageAccessToken}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logError("Facebook Messenger API error", data);
        throw new Error(
          `Facebook Messenger API error: ${data.error?.message || "Unknown error"}`
        );
      }

      this.log("Message sent successfully", data);
    } catch (error: any) {
      this.logError("Failed to send message to Facebook Messenger", error);
      throw error;
    }
  }

  /**
   * Map our attachment type to Facebook's attachment type
   */
  private mapAttachmentType(type: string): string {
    switch (type) {
      case "image":
        return "image";
      case "video":
        return "video";
      case "audio":
        return "audio";
      case "file":
      default:
        return "file";
    }
  }
}

/**
 * Factory function to create FacebookIntegration with user's access token
 * This retrieves the token from SocialAuth repository for the given user
 */
export async function createFacebookIntegrationForUser(userId: string): Promise<FacebookIntegration> {
  const { SocialAuthRepository } = await import("@/infrastructure/repositories/social-auth-repo");
  const { ObjectId } = await import("mongodb");

  const repo = new SocialAuthRepository();
  const auth = await repo.getByUserAndPlatform(new ObjectId(userId), "facebook");

  if (!auth) {
    throw new Error("Facebook account not connected for this user");
  }

  // Check if token is expired
  if (new Date() >= auth.expiresAt) {
    throw new Error("Facebook token has expired. Please reconnect your account.");
  }

  const config: FacebookConfig = {
    appId: process.env.FACEBOOK_APP_ID || "",
    appSecret: process.env.FACEBOOK_APP_SECRET || "",
    pageId: auth.openId,
    pageAccessToken: auth.accessToken,
  };

  if (!config.appId || !config.appSecret) {
    throw new Error("Missing Facebook client configuration. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET environment variables.");
  }

  return new FacebookIntegration(config);
}

/**
 * Factory function to create FacebookIntegration with provided access token
 * Used by workers and internal services
 */
export function createFacebookIntegration(accessToken: string, pageId?: string): FacebookIntegration {
  const config: FacebookConfig = {
    appId: process.env.FACEBOOK_APP_ID || "",
    appSecret: process.env.FACEBOOK_APP_SECRET || "",
    pageId: pageId || process.env.FACEBOOK_PAGE_ID || "",
    pageAccessToken: accessToken,
  };

  if (!config.appId || !config.appSecret || !config.pageAccessToken) {
    throw new Error("Missing Facebook configuration");
  }

  return new FacebookIntegration(config);
}

/**
 * Refresh Facebook long-lived token
 * Exchanges current token for a new long-lived token (60 days)
 */
export async function refreshFacebookToken(currentToken: string): Promise<{
  access_token: string;
  expires_in: number;
} | null> {
  try {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appId || !appSecret) {
      throw new Error("Missing Facebook client configuration");
    }

    const params = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: currentToken,
    });

    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("Failed to refresh Facebook token:", data.error);
      return null;
    }

    return {
      access_token: data.access_token,
      expires_in: data.expires_in || 5184000, // 60 days default
    };
  } catch (error) {
    console.error("Error refreshing Facebook token:", error);
    return null;
  }
}
