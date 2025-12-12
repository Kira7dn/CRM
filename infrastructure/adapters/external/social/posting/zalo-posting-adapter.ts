import type { PostMetrics, PostMedia } from "@/core/domain/marketing/post";
import type { ZaloAuthService } from "../auth/zalo-auth-service";
import { BasePostingAdapter } from "./base-posting-service";
import type { PostingPublishRequest, PostingPublishResponse } from "@/core/application/interfaces/marketing/posting-adapter";

/**
 * Zalo API Response Types
 */
interface ZaloResponse {
  error: number;
  message: string;
  data?: any;
}

interface ZaloMessageResponse extends ZaloResponse {
  data?: {
    message_id: string;
  };
}

interface ZaloUploadResponse extends ZaloResponse {
  data?: {
    attachment_id: string;
    url: string;
  };
}

export class ZaloPostingAdapter extends BasePostingAdapter {
  platform = "zalo" as const;
  private baseUrl = "https://openapi.zalo.me/v2.0";

  constructor(private auth: ZaloAuthService) {
    super();
  }

  async verifyAuth(): Promise<boolean> {
    return await this.auth.verifyAuth();
  }

  async publish(request: PostingPublishRequest): Promise<PostingPublishResponse> {
    try {
      if (!request.title && !request.body) {
        return {
          success: false,
          error: "Title or body is required for Zalo post",
        };
      }

      const message = this.formatMessage(request);

      // Zalo OA broadcasts to followers
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

  async update(postId: string, request: PostingPublishRequest): Promise<PostingPublishResponse> {
    return {
      success: false,
      error: "Zalo does not support updating sent messages",
    };
  }

  async delete(postId: string): Promise<boolean> {
    // Zalo OA doesn't support deleting messages
    return false;
  }

  async getMetrics(postId: string): Promise<PostMetrics> {
    try {
      const url = `${this.baseUrl}/message/status`;
      const params = new URLSearchParams({
        access_token: this.auth.getAccessToken(),
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
   * Publish text-only message to Zalo OA followers
   */
  private async publishTextPost(message: string): Promise<PostingPublishResponse> {
    try {
      // Get follower list to broadcast
      const followers = await this.getFollowers();

      if (followers.length === 0) {
        return {
          success: false,
          error: "No followers to send message to",
        };
      }

      // Broadcast to all followers
      const url = `${this.baseUrl}/oa/message`;
      const params = new URLSearchParams({
        access_token: this.auth.getAccessToken(),
      });

      const messageIds: string[] = [];

      // Send to each follower (Zalo has rate limits)
      for (const followerId of followers.slice(0, 50)) { // Limit to 50 for demo
        const response = await fetch(`${url}?${params.toString()}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient: {
              user_id: followerId,
            },
            message: {
              text: message,
            },
          }),
        });

        const data: ZaloMessageResponse = await response.json();

        if (data.error === 0 && data.data?.message_id) {
          messageIds.push(data.data.message_id);
        }
      }

      if (messageIds.length === 0) {
        return {
          success: false,
          error: "Failed to send message to any followers",
        };
      }

      return {
        success: true,
        postId: messageIds[0], // Return first message ID
        permalink: `https://oa.zalo.me/`, // Zalo OA doesn't provide permalinks
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Publish message with media attachments
   */
  private async publishWithMedia(message: string, media: PostMedia[]): Promise<PostingPublishResponse> {
    try {
      const firstMedia = media[0];

      // Upload media first
      const attachmentId = await this.uploadMedia(firstMedia);

      // Get followers
      const followers = await this.getFollowers();

      if (followers.length === 0) {
        return {
          success: false,
          error: "No followers to send message to",
        };
      }

      // Send message with attachment
      const url = `${this.baseUrl}/oa/message`;
      const params = new URLSearchParams({
        access_token: this.auth.getAccessToken(),
      });

      const messageIds: string[] = [];

      for (const followerId of followers.slice(0, 50)) {
        let messageBody: any;

        if (firstMedia.type === "image") {
          messageBody = {
            recipient: {
              user_id: followerId,
            },
            message: {
              attachment: {
                type: "template",
                payload: {
                  template_type: "media",
                  elements: [{
                    media_type: "image",
                    attachment_id: attachmentId,
                  }],
                },
              },
            },
          };
        } else {
          messageBody = {
            recipient: {
              user_id: followerId,
            },
            message: {
              text: message,
            },
          };
        }

        const response = await fetch(`${url}?${params.toString()}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messageBody),
        });

        const data: ZaloMessageResponse = await response.json();

        if (data.error === 0 && data.data?.message_id) {
          messageIds.push(data.data.message_id);
        }
      }

      if (messageIds.length === 0) {
        return {
          success: false,
          error: "Failed to send message to any followers",
        };
      }

      return {
        success: true,
        postId: messageIds[0],
        permalink: `https://oa.zalo.me/`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Upload media to Zalo
   */
  private async uploadMedia(media: PostMedia): Promise<string> {
    try {
      const url = `${this.baseUrl}/oa/upload/${media.type}`;
      const params = new URLSearchParams({
        access_token: this.auth.getAccessToken(),
      });

      const formData = new FormData();

      // Fetch media from URL and upload
      const mediaResponse = await fetch(media.url);
      const mediaBlob = await mediaResponse.blob();
      formData.append("file", mediaBlob);

      const response = await fetch(`${url}?${params.toString()}`, {
        method: "POST",
        body: formData,
      });

      const data: ZaloUploadResponse = await response.json();

      if (data.error !== 0 || !data.data?.attachment_id) {
        throw new Error(data.message || "Failed to upload media");
      }

      return data.data.attachment_id;
    } catch (error) {
      throw new Error(`Failed to upload media: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Get list of OA followers
   */
  private async getFollowers(): Promise<string[]> {
    try {
      const url = `${this.baseUrl}/oa/getfollowers`;
      const params = new URLSearchParams({
        access_token: this.auth.getAccessToken(),
        offset: "0",
        count: "50",
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data: any = await response.json();

      if (data.error !== 0 || !data.data?.followers) {
        return [];
      }

      return data.data.followers.map((f: any) => f.user_id);
    } catch (error) {
      console.error("Failed to get Zalo followers:", error);
      return [];
    }
  }

  /**
   * Format message with title, body and hashtags
   */
  protected formatMessage(request: PostingPublishRequest): string {
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
