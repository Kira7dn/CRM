import type {
  YouTubeIntegrationService,
  PlatformPublishRequest,
  PlatformPublishResponse,
} from "@/core/application/interfaces/platform-integration-service";
import type { PostMetrics, PostMedia } from "@/core/domain/managements/post";

/**
 * YouTube Data API Configuration
 */
export interface YouTubeConfig {
  apiKey: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  channelId: string;
}

/**
 * YouTube API Response Types
 */
interface YouTubeVideoUploadResponse {
  kind: string;
  etag: string;
  id: string;
  snippet?: {
    title: string;
    description: string;
    publishedAt: string;
  };
  status?: {
    uploadStatus: "uploaded" | "processed" | "failed";
    privacyStatus: "public" | "private" | "unlisted";
  };
}

interface YouTubeVideoResponse {
  kind: string;
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      publishedAt: string;
    };
    statistics: {
      viewCount: string;
      likeCount: string;
      commentCount: string;
      favoriteCount: string;
    };
    status: {
      uploadStatus: "uploaded" | "processed" | "failed";
      privacyStatus: "public" | "private" | "unlisted";
    };
  }>;
}

interface YouTubeErrorResponse {
  error: {
    code: number;
    message: string;
    errors: Array<{
      domain: string;
      reason: string;
      message: string;
    }>;
  };
}

/**
 * YouTube Data API v3 Integration
 * Implements uploading and managing videos on YouTube
 *
 * Required OAuth Scopes:
 * - https://www.googleapis.com/auth/youtube.upload
 * - https://www.googleapis.com/auth/youtube
 * - https://www.googleapis.com/auth/youtube.force-ssl
 *
 * API Documentation: https://developers.google.com/youtube/v3
 */
export class YouTubeIntegration implements YouTubeIntegrationService {
  platform = "youtube" as const;
  private baseUrl = "https://www.googleapis.com/youtube/v3";
  private uploadUrl = "https://www.googleapis.com/upload/youtube/v3";

  private _accessToken: string = ""; // Lưu trữ accessToken hiện tại
  constructor(private config: YouTubeConfig) { }

  // Phương thức để lấy accessToken hiện tại, đảm bảo nó đã được làm mới
  private async getValidAccessToken(): Promise<string> {
    // Nếu chưa có accessToken hoặc nó có vẻ đã hết hạn (chúng ta không có expire_in chính xác ở đây,
    // nhưng một ứng dụng thực tế sẽ lưu trữ nó)
    // Để đơn giản, chúng ta sẽ làm mới mỗi lần nếu _accessToken rỗng, hoặc dựa vào lỗi API.
    if (!this._accessToken) {
      this._accessToken = await this.refreshAccessToken();
    }
    return this._accessToken;
  }

  /**
   * Publish video to YouTube
   */
  async publish(request: PlatformPublishRequest): Promise<PlatformPublishResponse> {
    try {
      // YouTube requires video media
      const videoMedia = request.media.find((m) => m.type === "video");
      if (!videoMedia) {
        return {
          success: false,
          error: "YouTube requires video content",
        };
      }

      // Upload video
      const videoId = await this.uploadVideo(videoMedia, request.title, this.formatDescription(request));

      // Wait for processing
      const status = await this.waitForProcessing(videoId);
      if (status !== "ready") {
        return {
          success: false,
          error: `Video processing failed with status: ${status}`,
        };
      }

      return {
        success: true,
        postId: videoId,
        permalink: `https://www.youtube.com/watch?v=${videoId}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update existing YouTube video
   */
  async update(postId: string, request: PlatformPublishRequest): Promise<PlatformPublishResponse> {
    try {
      const token = await this.getValidAccessToken(); // Lấy token hợp lệ
      const url = `${this.baseUrl}/videos`;
      const params = new URLSearchParams({
        part: "snippet,status",
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: postId,
          snippet: {
            title: request.title,
            description: this.formatDescription(request),
            categoryId: "22", // People & Blogs
            tags: request.hashtags,
          },
          status: {
            privacyStatus: "public",
          },
        }),
      });

      const data = await response.json();

      if (data.error) {
        return {
          success: false,
          error: (data as YouTubeErrorResponse).error.message,
        };
      }

      return {
        success: true,
        postId,
        permalink: `https://www.youtube.com/watch?v=${postId}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete YouTube video
   */
  async delete(postId: string): Promise<boolean> {
    try {
      const token = await this.getValidAccessToken(); // Lấy token hợp lệ
      const url = `${this.baseUrl}/videos`;
      const params = new URLSearchParams({
        id: postId,
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.status === 204;
    } catch (error) {
      console.error("Failed to delete YouTube video:", error);
      return false;
    }
  }

  /**
   * Get metrics for a YouTube video
   */
  async getMetrics(postId: string): Promise<PostMetrics> {
    try {
      const token = await this.getValidAccessToken(); // Lấy token hợp lệ
      const url = `${this.baseUrl}/videos`;
      const params = new URLSearchParams({
        part: "statistics,snippet",
        id: postId,
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: YouTubeVideoResponse = await response.json();

      if (!data.items || data.items.length === 0) {
        throw new Error("Video not found");
      }

      const video = data.items[0];
      const stats = video.statistics;

      return {
        views: parseInt(stats.viewCount) || 0,
        likes: parseInt(stats.likeCount) || 0,
        comments: parseInt(stats.commentCount) || 0,
        shares: 0, // YouTube doesn't provide share count via API
        reach: parseInt(stats.viewCount) || 0,
        engagement: parseInt(stats.likeCount) + parseInt(stats.commentCount),
        lastSyncedAt: new Date(),
      };
    } catch (error) {
      console.error("Failed to get YouTube metrics:", error);
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
   * Verify YouTube authentication
   */
  async verifyAuth(): Promise<boolean> {
    try {
      const token = await this.getValidAccessToken(); // Lấy token hợp lệ
      const url = `${this.baseUrl}/channels`;
      const params = new URLSearchParams({
        part: "snippet",
        mine: "true",
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return !data.error;
    } catch (error) {
      return false;
    }
  }

  /**
   * Upload video to YouTube
   */
  async uploadVideo(media: PostMedia, title: string, description?: string): Promise<string> {
    try {
      const token = await this.getValidAccessToken(); // Lấy token hợp lệ

      // Step 1: Initialize upload with metadata
      const url = `${this.uploadUrl}/videos`;
      const params = new URLSearchParams({
        part: "snippet,status",
        uploadType: "resumable",
      });

      const metadata = {
        snippet: {
          title,
          description: description || "",
          categoryId: "22", // People & Blogs
          defaultLanguage: "vi",
        },
        status: {
          privacyStatus: "public",
          selfDeclaredMadeForKids: false,
        },
      };

      // Initialize resumable upload
      const initResponse = await fetch(`${url}?${params.toString()}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": "video/*",
        },
        body: JSON.stringify(metadata),
      });

      const uploadUrl = initResponse.headers.get("Location");
      if (!uploadUrl) {
        throw new Error("Failed to get upload URL");
      }

      // Step 2: Upload video file
      const videoResponse = await fetch(media.url);
      const videoBlob = await videoResponse.blob();

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "video/*",
        },
        body: videoBlob,
      });

      const data: YouTubeVideoUploadResponse = await uploadResponse.json();

      if (!data.id) {
        throw new Error("Failed to get video ID from upload response");
      }

      return data.id;
    } catch (error) {
      throw new Error(`Failed to upload video: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Get video processing status
   */
  async getVideoStatus(videoId: string): Promise<"processing" | "ready" | "failed"> {
    try {
      const token = await this.getValidAccessToken(); // Lấy token hợp lệ

      const url = `${this.baseUrl}/videos`;
      const params = new URLSearchParams({
        part: "status,processingDetails",
        id: videoId,
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: YouTubeVideoResponse = await response.json();

      if (!data.items || data.items.length === 0) {
        return "failed";
      }

      const status = data.items[0].status.uploadStatus;

      switch (status) {
        case "processed":
          return "ready";
        case "uploaded":
          return "processing";
        case "failed":
          return "failed";
        default:
          return "processing";
      }
    } catch (error) {
      return "failed";
    }
  }

  /**
   * Add video to playlist
   */
  async addToPlaylist(videoId: string, playlistId: string): Promise<boolean> {
    try {
      const token = await this.getValidAccessToken(); // Lấy token hợp lệ

      const url = `${this.baseUrl}/playlistItems`;
      const params = new URLSearchParams({
        part: "snippet",
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            playlistId,
            resourceId: {
              kind: "youtube#video",
              videoId,
            },
          },
        }),
      });

      const data = await response.json();
      return !data.error;
    } catch (error) {
      console.error("Failed to add video to playlist:", error);
      return false;
    }
  }

  /**
   * Wait for video processing to complete
   */
  private async waitForProcessing(videoId: string, maxAttempts = 60): Promise<"processing" | "ready" | "failed"> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getVideoStatus(videoId);

      if (status === "ready" || status === "failed") {
        return status;
      }

      // Wait 5 seconds before next check (YouTube processing can take longer)
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    return "failed";
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<string> {
    try {
      const url = "https://oauth2.googleapis.com/token";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.config.refreshToken,
          grant_type: "refresh_token",
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error_description || data.error);
      }

      return data.access_token;
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Format description with body and hashtags
   */
  private formatDescription(request: PlatformPublishRequest): string {
    let description = request.body || "";

    if (request.hashtags.length > 0) {
      description += "\n\n" + request.hashtags.map((tag) => `#${tag}`).join(" ");
    }

    return description;
  }
}

/**
 * Factory function to create YouTubeIntegration
 */

export async function createYouTubeIntegration(): Promise<YouTubeIntegration> {
  const config: YouTubeConfig = {
    apiKey: process.env.YOUTUBE_API_KEY || "",
    clientId: process.env.YOUTUBE_CLIENT_ID || "",
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || "",
    refreshToken: process.env.YOUTUBE_APP_REFRESH_TOKEN || "",
    channelId: process.env.YOUTUBE_APP_CHANNEL_ID || "",
  };

  if (!config.apiKey || !config.clientId || !config.clientSecret || !config.refreshToken || !config.channelId) {
    throw new Error("Missing YouTube configuration. Please set YOUTUBE_API_KEY, YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_APP_REFRESH_TOKEN, and YOUTUBE_APP_CHANNEL_ID environment variables.");
  }

  const integration = new YouTubeIntegration(config);
  // Ngay lập tức làm mới token để có accessToken hợp lệ sẵn sàng sử dụng
  await integration.refreshAccessToken();
  return integration;
}
