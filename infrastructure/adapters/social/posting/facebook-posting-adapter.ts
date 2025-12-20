import type { PostMetrics, PostMedia } from "@/core/domain/marketing/post";
import type {
  PostingAdapter,
  PostingPublishRequest,
  PostingPublishResponse,
} from "@/core/application/interfaces/marketing/posting-adapter";
import { formatMessage } from "./utils";

interface FacebookPostResponse {
  id?: string;
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

interface FacebookInsightsResponse {
  data?: Array<{
    name: string;
    values: Array<{ value: number }>;
  }>;
}

/**
 * Facebook Posting Adapter
 * Infrastructure-only: no auth validation, no business rules
 */
export class FacebookPostingAdapter implements PostingAdapter {
  platform = "facebook" as const;
  private readonly baseUrl = "https://graph.facebook.com/v19.0";

  constructor(
    private readonly token: string,
    private readonly pageId: string
  ) { }

  // -------- publish --------

  async publish(
    request: PostingPublishRequest
  ): Promise<PostingPublishResponse> {
    try {
      if (!request.title && !request.body) {
        return {
          success: false,
          error: "Facebook post requires title or body",
        };
      }

      const message = formatMessage(request);

      console.log("[Facebook] Publishing post:", {
        hasMedia: !!request.media,
        media: request.media,
        message: message.substring(0, 50) + "..."
      });

      if (!request.media) {
        return this.publishText(message);
      }

      if (request.media.type === "image") {
        return this.publishPhoto(message, request.media.url);
      }

      if (request.media.type === "video") {
        return this.publishVideo(message, request.media.url);
      }

      console.error("[Facebook] Unsupported media type:", request.media);
      return {
        success: false,
        error: `Unsupported media type: ${request.media.type || 'undefined'}`,
      };
    } catch (error) {
      return this.fail(error);
    }
  }

  // -------- update --------
  /**
   * Facebook only supports limited updates (mostly text).
   * Media updates are NOT supported.
   */
  async update(
    postId: string,
    request: PostingPublishRequest
  ): Promise<PostingPublishResponse> {
    try {
      const message = formatMessage(request);

      const response = await this.fbPost(`/${postId}`, {
        message,
      });

      if (response.error) {
        return this.fail(response.error.message);
      }

      return {
        success: true,
        postId,
      };
    } catch (error) {
      return this.fail(error);
    }
  }

  // -------- delete --------

  async delete(postId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${postId}?access_token=${this.token}`,
        { method: "DELETE" }
      );

      const data = await response.json();
      return response.ok && (data === true || data?.success === true);
    } catch {
      return false;
    }
  }

  // -------- metrics --------

  async getMetrics(postId: string): Promise<PostMetrics> {
    try {
      const post = await this.fbGet<{
        reactions?: { summary?: { total_count?: number } };
        comments?: { summary?: { total_count?: number } };
        shares?: { count?: number };
      }>(`/${postId}`, {
        fields: "reactions.summary(true),comments.summary(true),shares",
      });

      const insights = await this.fbGet<FacebookInsightsResponse>(`/${postId}/insights`, {
        metric:
          "post_impressions,post_impressions_unique,post_engaged_users",
      });

      const metrics: PostMetrics = {
        likes: post.reactions?.summary?.total_count ?? 0,
        comments: post.comments?.summary?.total_count ?? 0,
        shares: post.shares?.count ?? 0,
        views: 0,
        reach: 0,
        engagement: 0,
        lastSyncedAt: new Date(),
      };

      insights.data?.forEach((m) => {
        const value = m.values.at(-1)?.value ?? 0;
        if (m.name === "post_impressions") metrics.views = value;
        if (m.name === "post_impressions_unique") metrics.reach = value;
        if (m.name === "post_engaged_users") metrics.engagement = value;
      });

      return metrics;
    } catch {
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

  // ======================================================
  // Internal helpers
  // ======================================================

  private async publishText(
    message: string
  ): Promise<PostingPublishResponse> {
    const data = await this.fbPost(`/${this.pageId}/feed`, { message });

    if (data.error) {
      return this.fail(data.error.message);
    }

    return this.success(data.id!);
  }

  private async publishPhoto(
    message: string,
    url: string
  ): Promise<PostingPublishResponse> {
    const data = await this.fbPost(`/${this.pageId}/photos`, {
      url,
      message,
    });

    if (data.error) {
      return this.fail(data.error.message);
    }

    return this.success(data.id!);
  }

  private async publishVideo(
    message: string,
    url: string
  ): Promise<PostingPublishResponse> {
    const data = await this.fbPost(`/${this.pageId}/videos`, {
      file_url: url,
      description: message,
    });

    if (data.error) {
      return this.fail(data.error.message);
    }

    return this.success(data.id!);
  }

  private async fbGet<T>(
    path: string,
    params: Record<string, string>
  ): Promise<T> {
    const query = new URLSearchParams({
      ...params,
      access_token: this.token,
    });

    const res = await fetch(`${this.baseUrl}${path}?${query}`);
    return res.json() as Promise<T>;
  }


  private async fbPost(
    path: string,
    params: Record<string, string>
  ): Promise<FacebookPostResponse> {
    const body = new URLSearchParams({
      ...params,
      access_token: this.token,
    });

    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      body,
    });

    return res.json();
  }

  private success(postId: string): PostingPublishResponse {
    return {
      success: true,
      postId,
      permalink: `https://www.facebook.com/${this.pageId}/posts/${postId}`,
    };
  }

  private fail(error: unknown): PostingPublishResponse {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Unknown Facebook error",
    };
  }
}
