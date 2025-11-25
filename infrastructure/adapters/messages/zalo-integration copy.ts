import type {
  ZaloIntegrationService,
  PlatformPublishRequest,
  PlatformPublishResponse,
} from "@/core/application/interfaces/platform-integration-service";
import type { PostMetrics, PostMedia } from "@/core/domain/campaigns/post";

/**
 * Zalo OA (Official Account) API Configuration
 */
export interface ZaloConfig {
  oaId: string; // Official Account ID
  accessToken: string; // OA access token
  refreshToken: string;
  appId: string;
  secretKey: string;
}

/**
 * Zalo API Response Types
 */
interface ZaloResponse {
  error: number;
  message: string;
  data?: any;
}

interface ZaloUploadResponse extends ZaloResponse {
  data?: {
    attachment_id: string;
    url: string;
  };
}

interface ZaloMessageResponse extends ZaloResponse {
  data?: {
    message_id: string;
  };
}

interface ZaloFollowerListResponse extends ZaloResponse {
  data?: {
    total: number;
    followers: Array<{
      user_id: string;
    }>;
  };
}

/**
 * Zalo Official Account API Integration
 * Implements posting to Zalo OA followers
 *
 * Required Permissions:
 * - manage_oa
 * - send_message
 *
 * API Documentation: https://developers.zalo.me/docs/api/official-account-api
 */
export class ZaloIntegration implements ZaloIntegrationService {
  platform = "zalo" as const;
  private baseUrl = "https://openapi.zalo.me/v2.0/article/create";

  constructor(private config: ZaloConfig) { }

  /**
   * Publish message to Zalo OA followers
   * Note: Zalo OA requires broadcasting to followers, not posting to a feed
   */
  async publish(request: PlatformPublishRequest): Promise<PlatformPublishResponse> {
    try {
      // Format message
      const message = this.formatMessage(request);

      // Upload media if present
      let mediaId: string | undefined;
      if (request.media.length > 0) {
        mediaId = await this.uploadAttachment(request.media[0]);
      }

      // Send message to all followers
      return await this.sendMessage(message, mediaId);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update is not supported for Zalo messages
   */
  async update(postId: string, request: PlatformPublishRequest): Promise<PlatformPublishResponse> {
    return {
      success: false,
      error: "Zalo does not support updating sent messages",
    };
  }

  /**
   * Delete is not supported for Zalo messages
   */
  async delete(postId: string): Promise<boolean> {
    // Zalo OA doesn't support deleting messages
    return false;
  }

  /**
   * Get metrics for Zalo messages
   * Note: Zalo OA has limited analytics
   */
  async getMetrics(postId: string): Promise<PostMetrics> {
    try {
      // Zalo OA doesn't provide detailed message metrics
      // Return basic metrics from message info if available
      const url = `${this.baseUrl}/message/status`;
      const params = new URLSearchParams({
        access_token: this.config.accessToken,
        message_id: postId,
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data: ZaloResponse = await response.json();

      if (data.error !== 0) {
        throw new Error(data.message);
      }

      // Zalo OA analytics are limited
      return {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        reach: 0,
        engagement: 0,
        lastSyncedAt: new Date(),
      };
    } catch (error) {
      console.error("Failed to get Zalo metrics:", error);
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
   * Verify Zalo OA authentication
   */
  async verifyAuth(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/getoa`;
      const params = new URLSearchParams({
        access_token: this.config.accessToken,
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data: ZaloResponse = await response.json();

      return data.error === 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Upload attachment to Zalo
   */
  async uploadAttachment(media: PostMedia): Promise<string> {
    try {
      const url = `${this.baseUrl}/upload/${media.type === "image" ? "image" : "file"}`;

      // Fetch media file
      const mediaResponse = await fetch(media.url);
      const mediaBlob = await mediaResponse.blob();

      // Create form data
      const formData = new FormData();
      formData.append("file", mediaBlob, media.url.split("/").pop() || "file");

      const response = await fetch(url, {
        method: "POST",
        headers: {
          access_token: this.config.accessToken,
        },
        body: formData,
      });

      const data: ZaloUploadResponse = await response.json();

      if (data.error !== 0) {
        throw new Error(data.message);
      }

      return data.data?.attachment_id || "";
    } catch (error) {
      throw new Error(`Failed to upload attachment: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Send message to Zalo followers
   */
  async sendMessage(message: string, mediaId?: string): Promise<PlatformPublishResponse> {
    try {
      // Get all followers
      const followers = await this.getFollowers();

      if (followers.length === 0) {
        return {
          success: false,
          error: "No followers to send message to",
        };
      }

      // Prepare message payload
      const messagePayload: any = {
        recipient: {
          user_id: followers.map((f) => f.user_id),
        },
        message: {},
      };

      if (mediaId) {
        // Message with attachment
        messagePayload.message = {
          attachment: {
            type: "template",
            payload: {
              template_type: "media",
              elements: [
                {
                  media_type: "image",
                  attachment_id: mediaId,
                },
              ],
            },
          },
        };

        if (message) {
          messagePayload.message.text = message;
        }
      } else {
        // Text-only message
        messagePayload.message = {
          text: message,
        };
      }

      // Send broadcast message
      const url = `${this.baseUrl}/message`;
      const params = new URLSearchParams({
        access_token: this.config.accessToken,
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messagePayload),
      });

      const data: ZaloMessageResponse = await response.json();

      if (data.error !== 0) {
        return {
          success: false,
          error: data.message,
        };
      }

      return {
        success: true,
        postId: data.data?.message_id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get list of followers
   */
  private async getFollowers(): Promise<Array<{ user_id: string }>> {
    try {
      const url = `${this.baseUrl}/getfollowers`;
      const params = new URLSearchParams({
        access_token: this.config.accessToken,
        offset: "0",
        count: "50", // Zalo limits to 50 per request
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data: ZaloFollowerListResponse = await response.json();

      if (data.error !== 0) {
        throw new Error(data.message);
      }

      return data.data?.followers || [];
    } catch (error) {
      console.error("Failed to get Zalo followers:", error);
      return [];
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<string> {
    try {
      const url = "https://oauth.zaloapp.com/v4/oa/access_token";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          secret_key: this.config.secretKey,
        },
        body: new URLSearchParams({
          refresh_token: this.config.refreshToken,
          app_id: this.config.appId,
          grant_type: "refresh_token",
        }),
      });

      const data = await response.json();

      if (data.error !== 0) {
        throw new Error(data.message);
      }

      return data.access_token;
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Format message with hashtags
   */
  private formatMessage(request: PlatformPublishRequest): string {
    let message = request.title;
    if (request.body) {
      message += `\n\n${request.body}`;
    }

    if (request.hashtags.length > 0) {
      message += "\n\n" + request.hashtags.map((tag) => `#${tag}`).join(" ");
    }

    return message;
  }
}

/**
 * Factory function to create ZaloIntegration
 */
export function createZaloIntegration(): ZaloIntegration {
  const config: ZaloConfig = {
    oaId: process.env.ZALO_OA_ID || "",
    accessToken: process.env.ZALO_ACCESS_TOKEN || "",
    refreshToken: process.env.ZALO_REFRESH_TOKEN || "",
    appId: process.env.ZALO_APP_ID || "",
    secretKey: process.env.ZALO_SECRET_KEY || "",
  };

  if (!config.oaId || !config.accessToken || !config.appId || !config.secretKey) {
    throw new Error("Missing Zalo configuration. Please set ZALO_OA_ID, ZALO_ACCESS_TOKEN, ZALO_APP_ID, and ZALO_SECRET_KEY environment variables.");
  }

  return new ZaloIntegration(config);
}
