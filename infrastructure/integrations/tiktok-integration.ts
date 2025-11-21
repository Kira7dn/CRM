import type {
  TikTokIntegrationService,
  PlatformPublishRequest,
  PlatformPublishResponse,
} from "@/core/application/interfaces/platform-integration-service";
import type { PostMetrics, PostMedia } from "@/core/domain/managements/post";

/**
 * TikTok API Configuration
 */
export interface TikTokConfig {
  clientKey: string;
  clientSecret: string;
  accessToken: string; // User or Creator access token
}

/**
 * TikTok API Response Types
 */
interface TikTokVideoUploadResponse {
  data: {
    upload_url: string;
    video_id?: string;
    share_id?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

interface TikTokVideoStatusResponse {
  data: {
    status: "processing" | "ready" | "failed";
    share_id?: string;
  };
  error?: {
    code: string;
    message: string;
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

/**
 * TikTok Content Posting API Integration
 * Implements posting videos to TikTok
 *
 * Required Scopes:
 * - video.upload
 * - video.publish
 * - video.list
 *
 * API Documentation: https://developers.tiktok.com/doc/content-posting-api-get-started
 */
export class TikTokIntegration implements TikTokIntegrationService {
  platform = "tiktok" as const;
  private baseUrl = "https://open.tiktokapis.com/v2";

  constructor(private config: TikTokConfig) { }

  /**
   * Publish video to TikTok
   * Note: TikTok only supports video content
   */
  async publish(request: PlatformPublishRequest): Promise<PlatformPublishResponse> {
    try {
      // TikTok requires video media
      const videoMedia = request.media.find((m) => m.type === "video");
      if (!videoMedia) {
        return {
          success: false,
          error: "TikTok requires video content",
        };
      }

      // Step 1: Initialize video upload
      const uploadId = await this.uploadVideo(videoMedia);

      // Step 2: Wait for processing
      const status = await this.waitForProcessing(uploadId);
      if (status !== "ready") {
        return {
          success: false,
          error: `Video processing failed with status: ${status}`,
        };
      }

      // Step 3: Publish video
      return await this.publishVideo(uploadId, request);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update existing TikTok video
   * Note: TikTok API has limited update capabilities
   */
  async update(postId: string, request: PlatformPublishRequest): Promise<PlatformPublishResponse> {
    return {
      success: false,
      error: "TikTok does not support updating published videos",
    };
  }

  /**
   * Delete TikTok video
   */
  async delete(postId: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/post/video/delete/`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
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

  /**
   * Get metrics for a TikTok video
   */
  async getMetrics(postId: string): Promise<PostMetrics> {
    try {
      const url = `${this.baseUrl}/video/query/`;
      const params = new URLSearchParams({
        fields: "id,cover_image_url,share_url,statistics",
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
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
   * Verify TikTok authentication
   */
  async verifyAuth(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/user/info/`;
      const params = new URLSearchParams({
        fields: "open_id,union_id,avatar_url",
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
        },
      });

      const data = await response.json();
      return !data.error;
    } catch (error) {
      return false;
    }
  }

  /**
   * Upload video to TikTok
   */
  async uploadVideo(media: PostMedia): Promise<string> {
    try {
      // Step 1: Initialize upload
      const initUrl = `${this.baseUrl}/post/video/init/`;
      const initResponse = await fetch(initUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_info: {
            source: "FILE_UPLOAD",
            video_url: media.url,
          },
        }),
      });

      const initData: TikTokVideoUploadResponse = await initResponse.json();

      if (initData.error) {
        throw new Error(initData.error.message);
      }

      // Step 2: Upload video to provided URL
      const videoResponse = await fetch(media.url);
      const videoBlob = await videoResponse.blob();

      await fetch(initData.data.upload_url, {
        method: "PUT",
        body: videoBlob,
        headers: {
          "Content-Type": "video/mp4",
        },
      });

      return initData.data.video_id || "";
    } catch (error) {
      throw new Error(`Failed to upload video: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Get video upload status
   */
  async getUploadStatus(uploadId: string): Promise<"processing" | "ready" | "failed"> {
    try {
      const url = `${this.baseUrl}/post/video/status/`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_id: uploadId,
        }),
      });

      const data: TikTokVideoStatusResponse = await response.json();

      if (data.error) {
        return "failed";
      }

      return data.data.status;
    } catch (error) {
      return "failed";
    }
  }

  /**
   * Publish video after upload
   */
  private async publishVideo(videoId: string, request: PlatformPublishRequest): Promise<PlatformPublishResponse> {
    try {
      const url = `${this.baseUrl}/post/video/publish/`;

      const caption = this.formatCaption(request);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_id: videoId,
          post_info: {
            title: request.title,
            description: caption,
            privacy_level: "PUBLIC_TO_EVERYONE",
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
            video_cover_timestamp_ms: 1000,
          },
        }),
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
        postId: videoId,
        permalink: data.data?.share_url || `https://www.tiktok.com/@user/video/${videoId}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Wait for video processing to complete
   */
  private async waitForProcessing(uploadId: string, maxAttempts = 30): Promise<"processing" | "ready" | "failed"> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getUploadStatus(uploadId);

      if (status === "ready" || status === "failed") {
        return status;
      }

      // Wait 2 seconds before next check
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return "failed";
  }

  /**
   * Format caption with hashtags
   */
  private formatCaption(request: PlatformPublishRequest): string {
    let caption = request.body || "";

    if (request.hashtags.length > 0) {
      caption += " " + request.hashtags.map((tag) => `#${tag}`).join(" ");
    }

    return caption;
  }
}

/**
 * Factory function to create TikTokIntegration
 */
export function createTikTokIntegration(): TikTokIntegration {
  const config: TikTokConfig = {
    clientKey: process.env.TIKTOK_CLIENT_KEY || "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
    accessToken: process.env.TIKTOK_ACCESS_TOKEN || "",
  };

  if (!config.clientKey || !config.clientSecret || !config.accessToken) {
    throw new Error("Missing TikTok configuration. Please set TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, and TIKTOK_ACCESS_TOKEN environment variables.");
  }

  return new TikTokIntegration(config);
}
