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
  // oaId: string; // Official Account ID
  accessToken: string; // OA access token
  // refreshToken: string;
  // appId: string;
  // secretKey: string;
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
interface ZaloPayload {
  type: string;
  title: string;
  author: string;
  cover: {
    cover_type: string, //photo|video
    photo_url?: string,
    video_id?: string,
    cover_view?: string, //horizontal|vertical|square
    status: string, //show|hide
  };
  description: string;
  body: Array<{
    type: string; //text|image|video|product
    content?: string; //text only
    url?: string; //đường dẫn đến trang chứa video|image
    video_id?: string;
    caption?: string;
    thumb?: string; //Thumbnail của video. (Không bắt buộc).
    id?: string; //id của sản phẩm trên cửa hàng của OA.
  }>;
  status: string;  //show|hide
  comment: string; //show|hide
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
  private baseUrl = "https://openapi.zalo.me/v2.0";

  constructor(private config: ZaloConfig) { }

  /**
   * Publish message to Zalo OA followers
   * Note: Zalo OA requires broadcasting to followers, not posting to a feed
   */
  async publish(request: PlatformPublishRequest): Promise<PlatformPublishResponse> {
    try {
      // Validate request
      if (!request.title && !request.body) {
        return {
          success: false,
          error: "Title or body is required for Zalo post",
        };
      }
      // Format message
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
  /**
   * Publish text-only post (article without media)
   */
  private async publishTextPost(message: string): Promise<PlatformPublishResponse> {
    try {
      const url = `${this.baseUrl}/article/create`;

      const payload: ZaloPayload = {
        type: "normal",
        title: message.substring(0, 100), // Limit title length
        author: "CRM System",
        cover: {
          cover_type: "photo",
          status: "hide"
        },
        description: message.substring(0, 200),
        body: [
          {
            type: "text",
            content: message
          }
        ],
        status: "show",
        comment: "show"
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "access_token": this.config.accessToken,
        },
        body: JSON.stringify(payload),
      });

      const data: ZaloResponse = await response.json();

      if (data.error !== 0) {
        return {
          success: false,
          error: data.message,
        };
      }

      return {
        success: true,
        postId: data.data?.id || "",
        permalink: data.data?.url || "",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  /**
   * Publish post with media (photo/video)
   */
  private async publishWithMedia(message: string, media: PostMedia[]): Promise<PlatformPublishResponse> {
    try {
      const url = `${this.baseUrl}/article/create`;

      // Sort media by order
      const sortedMedia = media.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const firstMedia = sortedMedia[0];

      // Build cover from first media
      const cover: ZaloPayload["cover"] = {
        cover_type: firstMedia.type === "video" ? "video" : "photo",
        status: "show"
      };

      if (firstMedia.type === "image") {
        cover.photo_url = firstMedia.url;
        cover.cover_view = "horizontal";
      } else if (firstMedia.type === "video") {
        // For video, we need video_id - may need to upload first
        cover.video_id = firstMedia.url; // Placeholder - may need proper video upload
        cover.cover_view = "horizontal";
      }

      // Build body with text and media
      const body: ZaloPayload["body"] = [];

      // Add text content first
      if (message) {
        body.push({
          type: "text",
          content: message
        });
      }

      // Add all media items
      for (const item of sortedMedia) {
        if (item.type === "image") {
          body.push({
            type: "image",
            url: item.url,
          });
        } else if (item.type === "video") {
          body.push({
            type: "video",
            url: item.url,
            thumb: item.thumbnailUrl
          });
        }
      }

      const payload: ZaloPayload = {
        type: "normal",
        title: message.substring(0, 100) || "Post",
        author: "CRM System",
        cover: cover,
        description: message.substring(0, 200),
        body: body,
        status: "show",
        comment: "show"
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "access_token": this.config.accessToken,
        },
        body: JSON.stringify(payload),
      });

      const data: ZaloResponse = await response.json();

      if (data.error !== 0) {
        return {
          success: false,
          error: data.message,
        };
      }

      return {
        success: true,
        postId: data.data?.id || "",
        permalink: data.data?.url || "",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}


/**
 * Factory function to create ZaloIntegration
 */
export async function createZaloIntegration(): Promise<ZaloIntegration> {
  try {
    const response = await fetch("https://n8n.linkstrategy.io.vn/webhook/zalo_access_token");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const accessToken = data?.access_token; // kiểm tra key trả về từ webhook
    if (!accessToken) {
      throw new Error("Failed to get Zalo access token from webhook.");
    }

    return new ZaloIntegration({ accessToken });
  } catch (error) {
    throw new Error(`Error fetching Zalo access token: ${error}`);
  }
}

