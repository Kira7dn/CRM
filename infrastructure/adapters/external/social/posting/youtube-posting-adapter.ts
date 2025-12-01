import type { PostMetrics, PostMedia } from "@/core/domain/marketing/post";
import type { YouTubeAuthService } from "../auth/youtube-auth-service";
import { BasePostingAdapter } from "./base-posting-service";
import type { PostingPublishRequest, PostingPublishResponse } from "@/core/application/interfaces/social/posting-adapter";

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

export class YouTubePostingAdapter extends BasePostingAdapter {
  platform = "youtube" as const;
  private baseUrl = "https://www.googleapis.com/youtube/v3";
  private uploadUrl = "https://www.googleapis.com/upload/youtube/v3";

  constructor(private auth: YouTubeAuthService) {
    super();
  }

  async verifyAuth(): Promise<boolean> {
    return await this.auth.verifyAuth();
  }

  async publish(request: PostingPublishRequest): Promise<PostingPublishResponse> {
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

  async update(postId: string, request: PostingPublishRequest): Promise<PostingPublishResponse> {
    try {
      const token = this.auth.getAccessToken();
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

  async delete(postId: string): Promise<boolean> {
    try {
      const token = this.auth.getAccessToken();
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

  async getMetrics(postId: string): Promise<PostMetrics> {
    try {
      const token = this.auth.getAccessToken();
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
   * Upload video to YouTube using resumable upload protocol
   */
  private async uploadVideo(media: PostMedia, title: string, description?: string): Promise<string> {
    try {
      const token = this.auth.getAccessToken();

      // Step 1: Get video size from HEAD request
      console.log(`Checking video size from URL: ${media.url}`);
      const headResponse = await fetch(media.url, { method: "HEAD" });

      if (!headResponse.ok) {
        throw new Error(`Failed to access video URL: ${headResponse.status} ${headResponse.statusText}`);
      }

      const contentLength = headResponse.headers.get("Content-Length");
      if (!contentLength) {
        throw new Error("Video URL does not provide Content-Length header");
      }

      const videoSize = parseInt(contentLength, 10);
      console.log(`Video size: ${videoSize} bytes (${(videoSize / 1024 / 1024).toFixed(2)} MB)`);

      // Step 2: Initialize resumable upload session
      const initUrl = `${this.uploadUrl}/videos`;
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

      console.log("Initializing resumable upload session...");
      const initResponse = await fetch(`${initUrl}?${params.toString()}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8",
          "X-Upload-Content-Length": videoSize.toString(),
          "X-Upload-Content-Type": "video/*",
        },
        body: JSON.stringify(metadata),
      });

      if (!initResponse.ok) {
        const errorText = await initResponse.text();
        throw new Error(`Failed to initialize upload: ${initResponse.status} - ${errorText}`);
      }

      // Step 3: Get the resumable session URI
      const uploadSessionUri = initResponse.headers.get("Location");
      if (!uploadSessionUri) {
        throw new Error("Failed to get upload session URI from Location header");
      }

      console.log(`Upload session initialized. Session URI obtained.`);

      // Step 4: Stream video directly from URL to YouTube
      const videoId = await this.uploadVideoStream(uploadSessionUri, media.url, videoSize);

      console.log(`Video uploaded successfully. Video ID: ${videoId}`);
      return videoId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("YouTube upload error:", errorMessage);
      throw new Error(`Failed to upload video to YouTube: ${errorMessage}`);
    }
  }

  /**
   * Stream video directly from URL to YouTube without buffering entire file
   */
  private async uploadVideoStream(
    sessionUri: string,
    videoUrl: string,
    videoSize: number,
    maxRetries = 3
  ): Promise<string> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Upload attempt ${attempt + 1}/${maxRetries}...`);

        // Fetch video and stream it directly
        const videoResponse = await fetch(videoUrl);

        if (!videoResponse.ok) {
          throw new Error(`Failed to fetch video: ${videoResponse.status}`);
        }

        if (!videoResponse.body) {
          throw new Error("Video response has no body stream");
        }

        // Upload with streaming body
        const uploadResponse = await fetch(sessionUri, {
          method: "PUT",
          headers: {
            "Content-Length": videoSize.toString(),
            "Content-Type": "video/*",
          },
          body: videoResponse.body,
          // @ts-ignore - duplex is needed for streaming in Node.js fetch
          duplex: "half",
        });

        // HTTP 200 or 201 - Upload successful
        if (uploadResponse.status === 200 || uploadResponse.status === 201) {
          const data: YouTubeVideoUploadResponse = await uploadResponse.json();
          if (!data.id) {
            throw new Error("Upload completed but no video ID in response");
          }
          console.log(`Upload successful! Video ID: ${data.id}, Status: ${data.status?.uploadStatus}`);
          return data.id;
        }

        // HTTP 308 - Resume incomplete
        if (uploadResponse.status === 308) {
          console.log("Upload incomplete (308). Retrying...");
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }

        // HTTP 5xx - Server error
        if (uploadResponse.status >= 500) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt), 16000);
          console.warn(`Server error ${uploadResponse.status}. Retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        // HTTP 4xx - Client error (permanent failure)
        if (uploadResponse.status >= 400 && uploadResponse.status < 500) {
          const errorText = await uploadResponse.text();
          throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
        }

        // Unexpected status
        const errorText = await uploadResponse.text();
        throw new Error(`Unexpected response ${uploadResponse.status}: ${errorText}`);

      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw error; // Max retries exceeded
        }

        // Retry network errors
        if (error instanceof TypeError) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt), 16000);
          console.warn(`Network error. Retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        throw error; // Non-retryable error
      }
    }

    throw new Error("Upload failed after maximum retries");
  }

  /**
   * Get video processing status
   */
  private async getVideoStatus(videoId: string): Promise<"processing" | "ready" | "failed"> {
    try {
      const token = this.auth.getAccessToken();
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
   * Wait for video processing to complete
   */
  private async waitForProcessing(videoId: string, maxAttempts = 60): Promise<"processing" | "ready" | "failed"> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getVideoStatus(videoId);

      if (status === "ready" || status === "failed") {
        return status;
      }

      // Wait 5 seconds before next check
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    return "failed";
  }

  /**
   * Format description with body and hashtags
   */
  private formatDescription(request: PostingPublishRequest): string {
    let description = request.body || "";

    if (request.hashtags.length > 0) {
      description += "\n\n" + request.hashtags.map((tag) => `#${tag}`).join(" ");
    }

    return description;
  }
}
