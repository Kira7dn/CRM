import type { PostMetrics, PostMedia } from "@/core/domain/marketing/post";
import type { PostingAdapter, PostingPublishRequest, PostingPublishResponse } from "@/core/application/interfaces/marketing/posting-adapter";
import { emptyMetrics, sleep } from "./utils";

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

export class YouTubePostingAdapter implements PostingAdapter {
  platform = "youtube" as const;
  private baseUrl = "https://www.googleapis.com/youtube/v3";
  private uploadUrl = "https://www.googleapis.com/upload/youtube/v3";

  constructor(private token: string) { }

  async publish(request: PostingPublishRequest): Promise<PostingPublishResponse> {
    if (!request.media || request.media.type !== "video") {
      return {
        success: false,
        error: "YouTube requires video content",
      };
    }

    const videoId = await this.uploadVideo(
      request.media,
      request.title ?? "",
      this.formatDescription(request)
    );

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
  }

  async update(postId: string, request: PostingPublishRequest): Promise<PostingPublishResponse> {
    try {
      const res = await fetch(
        `${this.baseUrl}/videos?part=snippet,status`,
        {
          method: "PUT",
          headers: this.jsonHeaders(),
          body: JSON.stringify({
            id: postId,
            snippet: {
              title: request.title,
              description: this.formatDescription(request),
              categoryId: "22",
              tags: request.hashtags,
            },
            status: {
              privacyStatus: "public",
            },
          }),
        }
      );

      const data = await res.json();
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
      const res = await fetch(
        `${this.baseUrl}/videos?id=${postId}`,
        {
          method: "DELETE",
          headers: this.authHeaders(),
        }
      );

      return res.status === 204;
    } catch {
      return false;
    }
  }

  async getMetrics(postId: string): Promise<PostMetrics> {
    try {
      const res = await fetch(
        `${this.baseUrl}/videos?part=statistics&id=${postId}`,
        { headers: this.authHeaders() }
      );

      const data: YouTubeVideoResponse = await res.json();
      const video = data.items?.[0];
      const s = video?.statistics;

      return {
        views: Number(s?.viewCount ?? 0),
        likes: Number(s?.likeCount ?? 0),
        comments: Number(s?.commentCount ?? 0),
        shares: 0,
        reach: Number(s?.viewCount ?? 0),
        engagement:
          Number(s?.likeCount ?? 0) +
          Number(s?.commentCount ?? 0),
        lastSyncedAt: new Date(),
      };
    } catch {
      return emptyMetrics();
    }
  }

  // ================== PRIVATE ==================

  private async uploadVideo(
    media: PostMedia,
    title: string,
    description: string
  ): Promise<string> {
    const head = await fetch(media.url, { method: "HEAD" });
    const size = Number(head.headers.get("Content-Length"));

    if (!size) {
      throw new Error("Video URL missing Content-Length");
    }

    const init = await fetch(
      `${this.uploadUrl}/videos?part=snippet,status&uploadType=resumable`,
      {
        method: "POST",
        headers: {
          ...this.jsonHeaders(),
          "X-Upload-Content-Length": size.toString(),
          "X-Upload-Content-Type": "video/*",
        },
        body: JSON.stringify({
          snippet: {
            title,
            description,
            categoryId: "22",
            defaultLanguage: "vi",
          },
          status: {
            privacyStatus: "public",
            selfDeclaredMadeForKids: false,
          },
        }),
      }
    );

    const sessionUri = init.headers.get("Location");
    if (!sessionUri) {
      throw new Error("Missing resumable upload session URI");
    }

    return this.uploadVideoStream(sessionUri, media.url, size);
  }

  private async uploadVideoStream(
    sessionUri: string,
    videoUrl: string,
    videoSize: number,
    retries = 3
  ): Promise<string> {
    for (let i = 0; i < retries; i++) {
      const stream = await fetch(videoUrl);
      const res = await fetch(sessionUri, {
        method: "PUT",
        headers: {
          "Content-Length": videoSize.toString(),
          "Content-Type": "video/*",
        },
        body: stream.body,
        // @ts-ignore
        duplex: "half",
      });

      if (res.status === 200 || res.status === 201) {
        const data: YouTubeVideoUploadResponse = await res.json();
        return data.id;
      }

      if (res.status === 308) {
        await sleep(2000);
        continue;
      }

      if (res.status >= 500) {
        await sleep(1000 * Math.pow(2, i));
        continue;
      }

      throw new Error(await res.text());
    }

    throw new Error("Upload failed after retries");
  }

  private async getVideoStatus(videoId: string): Promise<"processing" | "ready" | "failed"> {
    const res = await fetch(
      `${this.baseUrl}/videos?part=status&id=${videoId}`,
      { headers: this.authHeaders() }
    );

    const data: YouTubeVideoResponse = await res.json();
    const status = data.items?.[0]?.status.uploadStatus;

    if (status === "processed") return "ready";
    if (status === "failed") return "failed";
    return "processing";
  }

  private async waitForProcessing(
    videoId: string,
    maxAttempts = 60
  ): Promise<"processing" | "ready" | "failed"> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getVideoStatus(videoId);
      if (status !== "processing") return status;
      await sleep(5000);
    }
    return "failed";
  }

  private formatDescription(request: PostingPublishRequest): string {
    const tags =
      request.hashtags?.map((t) => `#${t}`).join(" ") ?? "";
    return [request.body, tags].filter(Boolean).join("\n\n");
  }

  private authHeaders(): HeadersInit {
    return { Authorization: `Bearer ${this.token}` };
  }

  private jsonHeaders(): HeadersInit {
    return {
      ...this.authHeaders(),
      "Content-Type": "application/json",
    };
  }
}
