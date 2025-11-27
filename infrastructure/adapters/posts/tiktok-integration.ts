import type {
  TikTokIntegrationService,
  PlatformPublishRequest,
  PlatformPublishResponse,
} from "@/core/application/interfaces/platform-integration-service";
import type { PostMetrics, PostMedia } from "@/core/domain/campaigns/post";

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

      // Step 3: Publish video
      return await this.publishVideo(videoMedia, request);
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
  private async publishVideo(media: PostMedia, request: PlatformPublishRequest): Promise<PlatformPublishResponse> {
    try {
      const url = `${this.baseUrl}/post/publish/video/init/`;

      const caption = this.formatCaption(request);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_info: {
            source: "PULL_FROM_URL",
            video_url: media.url
          },
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
        postId: data.publish_id,
        permalink: data.data?.share_url || `https://www.tiktok.com/@user/video/${data.publish_id}`,
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
 * Factory function to create TikTokIntegration with user's access token
 * This retrieves the token from SocialAuth repository for the given user
 */
export async function createTikTokIntegrationForUser(userId: string): Promise<TikTokIntegration> {
  const { SocialAuthRepository } = await import("@/infrastructure/repositories/social-auth-repo");
  const { ObjectId } = await import("mongodb");

  const repo = new SocialAuthRepository();
  const auth = await repo.getByUserAndPlatform(new ObjectId(userId), "tiktok");

  if (!auth) {
    throw new Error("TikTok account not connected for this user");
  }

  // Check if token is expired
  if (new Date() >= auth.expiresAt) {
    throw new Error("TikTok token has expired. Please reconnect your account.");
  }

  const config: TikTokConfig = {
    clientKey: process.env.TIKTOK_CLIENT_KEY || "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
    accessToken: auth.accessToken,
  };

  if (!config.clientKey || !config.clientSecret) {
    throw new Error("Missing TikTok client configuration. Please set TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET environment variables.");
  }

  return new TikTokIntegration(config);
}

/**
 * Factory function to create TikTokIntegration with provided access token
 * Used by workers and internal services
 */
export function createTikTokIntegration(accessToken: string): TikTokIntegration {
  const config: TikTokConfig = {
    clientKey: process.env.TIKTOK_CLIENT_KEY || "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
    accessToken,
  };

  if (!config.clientKey || !config.clientSecret || !config.accessToken) {
    throw new Error("Missing TikTok configuration");
  }

  return new TikTokIntegration(config);
}

/**
 * Refresh TikTok access token using refresh token
 */
export async function refreshTikTokToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  open_id: string;
  scope: string;
} | null> {
  try {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

    if (!clientKey || !clientSecret) {
      throw new Error("Missing TikTok client configuration");
    }

    const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("Failed to refresh TikTok token:", data.error);
      return null;
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      open_id: data.open_id,
      scope: data.scope,
    };
  } catch (error) {
    console.error("Error refreshing TikTok token:", error);
    return null;
  }
}
