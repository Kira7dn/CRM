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
interface TikTokPublishInitResponse {
  data: {
    publish_id: string;
    upload_url?: string; // Only for FILE_UPLOAD
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
    publicaly_available_post_id?: string[]; // Typo is in TikTok's API
    uploaded_bytes?: number;
    fail_reason?: string;
  };
  error: {
    code: string;
    message: string;
    log_id: string;
  };
}

interface TikTokCreatorInfoResponse {
  data: {
    creator_avatar_url: string;
    creator_username: string;
    creator_nickname: string;
    privacy_level_options: string[];
    comment_disabled: boolean;
    duet_disabled: boolean;
    stitch_disabled: boolean;
    max_video_post_duration_sec: number;
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

      // Use Direct Post flow to publish video
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
   * Upload video to TikTok using FILE_UPLOAD method
   * Note: This is a legacy method - publishVideo() uses PULL_FROM_URL which is simpler
   */
  async uploadVideo(media: PostMedia): Promise<string> {
    try {
      // For FILE_UPLOAD, we need file size information
      // This method is kept for interface compatibility but PULL_FROM_URL is preferred
      const initUrl = `${this.baseUrl}/post/publish/video/init/`;
      const initResponse = await fetch(initUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_info: {
            title: "Uploaded video",
            privacy_level: "SELF_ONLY",
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
        }),
      });

      const initData: TikTokPublishInitResponse = await initResponse.json();

      if (initData.error.code !== "ok") {
        throw new Error(initData.error.message);
      }

      return initData.data.publish_id;
    } catch (error) {
      throw new Error(`Failed to upload video: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Get upload status (required by interface)
   * Maps to the new publish status API
   */
  async getUploadStatus(uploadId: string): Promise<"processing" | "ready" | "failed"> {
    const statusData = await this.getPublishStatus(uploadId);

    if (!statusData) {
      return "failed";
    }

    switch (statusData.status) {
      case "PUBLISH_COMPLETE":
        return "ready";
      case "FAILED":
        return "failed";
      case "PROCESSING_UPLOAD":
      case "PROCESSING_DOWNLOAD":
      case "SCHEDULED":
      default:
        return "processing";
    }
  }

  /**
   * Get publish status using the new Content Posting API
   */
  private async getPublishStatus(publishId: string): Promise<TikTokPublishStatusResponse["data"] | null> {
    try {
      const url = `${this.baseUrl}/post/publish/status/fetch/`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
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
   * Publish video using Direct Post flow
   */
  private async publishVideo(media: PostMedia, request: PlatformPublishRequest): Promise<PlatformPublishResponse> {
    try {
      // Step 1: Initialize video publish with Direct Post mode
      const url = `${this.baseUrl}/post/publish/video/init/`;
      const caption = this.formatCaption(request);

      // Determine privacy level - use PUBLIC_TO_EVERYONE for posts that need permalinks
      // Note: Unaudited apps may be restricted to SELF_ONLY by TikTok
      const privacyLevel = "SELF_ONLY"; // Options: PUBLIC_TO_EVERYONE, MUTUAL_FOLLOW_FRIENDS, SELF_ONLY

      const requestBody = {
        post_info: {
          title: request.title || "",
          description: caption,
          privacy_level: privacyLevel,
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: media.url,
        },
        post_mode: "DIRECT_POST", // Direct post mode
        media_type: "VIDEO",
      };

      console.log("TikTok publish request:", JSON.stringify(requestBody, null, 2));

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
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

      // Step 2: Poll for completion and get permalink
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
   * Polls the status endpoint until PUBLISH_COMPLETE or FAILED
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
          // Get the post ID from the response
          const postIds = statusData.publicaly_available_post_id;
          if (postIds && postIds.length > 0) {
            const postId = postIds[0];
            // Construct permalink using the post ID
            const permalink = `https://www.tiktok.com/@_/video/${postId}`;
            console.log(`TikTok publish complete with permalink: ${permalink}`);
            return {
              success: true,
              permalink,
            };
          }

          // If completed but no post ID yet, wait a bit longer
          if (!completedWithoutPostId) {
            console.log("TikTok publish complete but no post ID yet, continuing to poll...");
            completedWithoutPostId = true;
            await new Promise((resolve) => setTimeout(resolve, intervalMs));
            break;
          }

          // If we've already waited extra time, return with warning
          console.warn("TikTok publish complete but no publicaly_available_post_id returned. This may be due to SELF_ONLY privacy setting.");
          return {
            success: true,
            permalink: `https://www.tiktok.com/`, // Fallback if no post ID (e.g., private posts)
          };

        case "FAILED":
          console.error(`TikTok publish failed: ${statusData.fail_reason}`);
          return {
            success: false,
            error: statusData.fail_reason || "Publish failed",
          };

        case "PROCESSING_UPLOAD":
        case "PROCESSING_DOWNLOAD":
          // Still processing, continue polling
          await new Promise((resolve) => setTimeout(resolve, intervalMs));
          break;

        case "SCHEDULED":
          // Scheduled post - consider this success
          console.log("TikTok post scheduled successfully");
          return {
            success: true,
            permalink: "https://www.tiktok.com/", // TikTok doesn't provide permalink for scheduled posts
          };

        default:
          // Unknown status, continue polling
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
