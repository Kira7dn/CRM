import type { PostMetrics, PostMedia } from "@/core/domain/marketing/post";
import type { TikTokAuthService } from "../auth/tiktok-auth-service";
import { BasePostingAdapter } from "./base-posting-service";
import type { PostingPublishRequest, PostingPublishResponse } from "@/core/application/interfaces/marketing/posting-adapter";

/**
 * TikTok API Response Types
 */
interface TikTokPublishInitResponse {
  data: {
    publish_id: string;
    upload_url?: string;
  };
  error: {
    code: string;
    message: string;
    log_id: string;
  };
}

interface TikTokPublishStatusResponse {
  data: {
    status: "PROCESSING_UPLOAD" | "PROCESSING_DOWNLOAD" | "PUBLISH_COMPLETE" | "FAILED" | "SCHEDULED";
    publicaly_available_post_id?: string[];
    uploaded_bytes?: number;
    fail_reason?: string;
  };
  error: {
    code: string;
    message: string;
    log_id: string;
  };
}

interface TikTokVideoInfoResponse {
  data: {
    video_id: string;
    share_url: string;
    cover_image_url: string;
    statistics?: {
      view_count: number;
      like_count: number;
      comment_count: number;
      share_count: number;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

export class TikTokPostingAdapter extends BasePostingAdapter {
  platform = "tiktok" as const;
  private baseUrl = "https://open.tiktokapis.com/v2";

  constructor(private auth: TikTokAuthService) {
    super();
  }

  async verifyAuth(): Promise<boolean> {
    return await this.auth.verifyAuth();
  }

  async publish(request: PostingPublishRequest): Promise<PostingPublishResponse> {
    try {
      // TikTok requires video media
      const videoMedia = request.media.find((m) => m.type === "video");
      if (!videoMedia) {
        return {
          success: false,
          error: "TikTok requires video content",
        };
      }

      // Use Direct Post flow to publish video
      return await this.publishVideo(videoMedia, request);
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
      error: "TikTok does not support updating published videos",
    };
  }

  async delete(postId: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/post/video/delete/`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.auth.getAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_id: postId,
        }),
      });

      const data = await response.json();
      return !data.error;
    } catch (error) {
      console.error("Failed to delete TikTok video:", error);
      return false;
    }
  }

  async getMetrics(postId: string): Promise<PostMetrics> {
    try {
      const url = `${this.baseUrl}/video/query/`;
      const params = new URLSearchParams({
        fields: "id,cover_image_url,share_url,statistics",
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.auth.getAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filters: {
            video_ids: [postId],
          },
        }),
      });

      const data: TikTokVideoInfoResponse = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const stats = data.data.statistics;

      return {
        views: stats?.view_count || 0,
        likes: stats?.like_count || 0,
        comments: stats?.comment_count || 0,
        shares: stats?.share_count || 0,
        reach: stats?.view_count || 0,
        engagement: (stats?.like_count || 0) + (stats?.comment_count || 0) + (stats?.share_count || 0),
        lastSyncedAt: new Date(),
      };
    } catch (error) {
      console.error("Failed to get TikTok metrics:", error);
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
   * Publish video using Direct Post flow
   */
  private async publishVideo(media: PostMedia, request: PostingPublishRequest): Promise<PostingPublishResponse> {
    try {
      const url = `${this.baseUrl}/post/publish/video/init/`;
      const caption = this.formatCaption(request);

      const requestBody = {
        post_info: {
          title: request.title || "",
          description: caption,
          privacy_level: "SELF_ONLY", // PUBLIC_TO_EVERYONE, MUTUAL_FOLLOW_FRIENDS, SELF_ONLY
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: media.url,
        },
        post_mode: "DIRECT_POST",
        media_type: "VIDEO",
      };

      console.log("TikTok publish request:", JSON.stringify(requestBody, null, 2));

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.auth.getAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data: TikTokPublishInitResponse = await response.json();
      console.log("TikTok publish init response:", JSON.stringify(data, null, 2));

      if (data.error.code !== "ok") {
        return {
          success: false,
          error: `${data.error.message} (log_id: ${data.error.log_id})`,
        };
      }

      const publishId = data.data.publish_id;

      // Poll for completion and get permalink
      const statusResult = await this.waitForPublishComplete(publishId);

      if (!statusResult.success) {
        return {
          success: false,
          error: statusResult.error || "Failed to complete publish",
        };
      }

      return {
        success: true,
        postId: publishId,
        permalink: statusResult.permalink,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Wait for publish to complete and retrieve the permalink
   */
  private async waitForPublishComplete(
    publishId: string,
    maxAttempts = 60,
    intervalMs = 3000
  ): Promise<{ success: boolean; permalink?: string; error?: string }> {
    let completedWithoutPostId = false;

    for (let i = 0; i < maxAttempts; i++) {
      const statusData = await this.getPublishStatus(publishId);

      if (!statusData) {
        return {
          success: false,
          error: "Failed to fetch publish status",
        };
      }

      console.log(`TikTok publish status (attempt ${i + 1}/${maxAttempts}):`, {
        status: statusData.status,
        hasPostId: !!statusData.publicaly_available_post_id,
        postIds: statusData.publicaly_available_post_id,
        uploadedBytes: statusData.uploaded_bytes,
      });

      switch (statusData.status) {
        case "PUBLISH_COMPLETE":
          const postIds = statusData.publicaly_available_post_id;
          if (postIds && postIds.length > 0) {
            const postId = postIds[0];
            const permalink = `https://www.tiktok.com/@_/video/${postId}`;
            console.log(`TikTok publish complete with permalink: ${permalink}`);
            return {
              success: true,
              permalink,
            };
          }

          if (!completedWithoutPostId) {
            console.log("TikTok publish complete but no post ID yet, continuing to poll...");
            completedWithoutPostId = true;
            await new Promise((resolve) => setTimeout(resolve, intervalMs));
            break;
          }

          console.warn("TikTok publish complete but no publicaly_available_post_id returned.");
          return {
            success: true,
            permalink: `https://www.tiktok.com/`,
          };

        case "FAILED":
          console.error(`TikTok publish failed: ${statusData.fail_reason}`);
          return {
            success: false,
            error: statusData.fail_reason || "Publish failed",
          };

        case "PROCESSING_UPLOAD":
        case "PROCESSING_DOWNLOAD":
          await new Promise((resolve) => setTimeout(resolve, intervalMs));
          break;

        case "SCHEDULED":
          console.log("TikTok post scheduled successfully");
          return {
            success: true,
            permalink: "https://www.tiktok.com/",
          };

        default:
          console.log(`Unknown TikTok status: ${statusData.status}, continuing to poll...`);
          await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }

    return {
      success: false,
      error: "Timeout waiting for publish to complete",
    };
  }

  /**
   * Get publish status
   */
  private async getPublishStatus(publishId: string): Promise<TikTokPublishStatusResponse["data"] | null> {
    try {
      const url = `${this.baseUrl}/post/publish/status/fetch/`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.auth.getAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publish_id: publishId,
        }),
      });

      const data: TikTokPublishStatusResponse = await response.json();

      if (data.error.code !== "ok") {
        console.error("TikTok status fetch error:", data.error);
        return null;
      }

      return data.data;
    } catch (error) {
      console.error("Failed to get TikTok publish status:", error);
      return null;
    }
  }

  /**
   * Format caption with hashtags
   */
  private formatCaption(request: PostingPublishRequest): string {
    let caption = request.body || "";

    if (request.hashtags.length > 0) {
      caption += " " + request.hashtags.map((tag) => `#${tag}`).join(" ");
    }

    return caption;
  }
}
