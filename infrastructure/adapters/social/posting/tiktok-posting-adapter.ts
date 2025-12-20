import type { PostMetrics, PostMedia } from "@/core/domain/marketing/post";
import type { PostingAdapter, PostingPublishRequest, PostingPublishResponse } from "@/core/application/interfaces/marketing/posting-adapter";
import { emptyMetrics, sleep } from "./utils";

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

/**
 * TikTok Posting Adapter
 * Handles publishing videos to TikTok
 */
export class TikTokPostingAdapter implements PostingAdapter {
  platform = "tiktok" as const;
  private baseUrl = "https://open.tiktokapis.com/v2";

  constructor(private token: string) { }

  async publish(request: PostingPublishRequest): Promise<PostingPublishResponse> {
    if (!request.media || request.media.type !== "video") {
      return {
        success: false,
        error: "TikTok requires video content",
      };
    }

    return this.publishVideo(request.media, request);
  }

  async update(): Promise<PostingPublishResponse> {
    return {
      success: false,
      error: "TikTok does not support updating published videos",
    };
  }

  async delete(postId: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/post/video/delete/`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({ video_id: postId }),
      });

      const data = await res.json();
      return !data.error;
    } catch {
      return false;
    }
  }

  async getMetrics(postId: string): Promise<PostMetrics> {
    try {
      const res = await fetch(
        `${this.baseUrl}/video/query/?fields=id,statistics`,
        {
          method: "POST",
          headers: this.headers(),
          body: JSON.stringify({
            filters: { video_ids: [postId] },
          }),
        }
      );

      const data: TikTokVideoInfoResponse = await res.json();
      const s = data.data.statistics;

      return {
        views: s?.view_count ?? 0,
        likes: s?.like_count ?? 0,
        comments: s?.comment_count ?? 0,
        shares: s?.share_count ?? 0,
        reach: s?.view_count ?? 0,
        engagement:
          (s?.like_count ?? 0) +
          (s?.comment_count ?? 0) +
          (s?.share_count ?? 0),
        lastSyncedAt: new Date(),
      };
    } catch {
      return emptyMetrics();
    }
  }

  // ================== PRIVATE ==================

  private async publishVideo(
    media: PostMedia,
    request: PostingPublishRequest
  ): Promise<PostingPublishResponse> {
    const res = await fetch(
      `${this.baseUrl}/post/publish/video/init/`,
      {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          post_info: {
            title: request.title ?? "",
            description: this.formatCaption(request),
            privacy_level: "SELF_ONLY",
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
          },
          source_info: {
            source: "PULL_FROM_URL",
            video_url: media.url,
          },
          post_mode: "DIRECT_POST",
          media_type: "VIDEO",
        }),
      }
    );

    const data: TikTokPublishInitResponse = await res.json();

    if (data.error?.code !== "ok") {
      return {
        success: false,
        error: data.error?.message ?? "TikTok publish init failed",
      };
    }

    const result = await this.waitForPublishComplete(
      data.data.publish_id
    );

    return result.success
      ? {
        success: true,
        postId: data.data.publish_id,
        permalink: result.permalink,
      }
      : result;
  }

  private async waitForPublishComplete(
    publishId: string,
    maxAttempts = 60,
    intervalMs = 3000
  ): Promise<{ success: boolean; permalink?: string; error?: string }> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getPublishStatus(publishId);
      if (!status) break;

      if (status.status === "PUBLISH_COMPLETE") {
        const id = status.publicaly_available_post_id?.[0];
        return {
          success: true,
          permalink: id
            ? `https://www.tiktok.com/@_/video/${id}`
            : "https://www.tiktok.com/",
        };
      }

      if (status.status === "FAILED") {
        return {
          success: false,
          error: status.fail_reason ?? "Publish failed",
        };
      }

      await sleep(intervalMs);
    }

    return {
      success: false,
      error: "Timeout waiting for TikTok publish",
    };
  }

  private async getPublishStatus(
    publishId: string
  ): Promise<TikTokPublishStatusResponse["data"] | null> {
    try {
      const res = await fetch(
        `${this.baseUrl}/post/publish/status/fetch/`,
        {
          method: "POST",
          headers: this.headers(),
          body: JSON.stringify({ publish_id: publishId }),
        }
      );

      const data: TikTokPublishStatusResponse = await res.json();
      return data.error?.code === "ok" ? data.data : null;
    } catch {
      return null;
    }
  }

  private formatCaption(request: PostingPublishRequest): string {
    const tags =
      request.hashtags?.map((t) => `#${t}`).join(" ") ?? "";
    return [request.body, tags].filter(Boolean).join(" ");
  }

  private headers(): HeadersInit {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }
}
