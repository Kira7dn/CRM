import type { PostMetrics, PostMedia } from "@/core/domain/marketing/post";
import type {
  PostingAdapter,
  PostingPublishRequest,
  PostingPublishResponse,
} from "@/core/application/interfaces/marketing/posting-adapter";
import { formatMessage } from "./utils";

interface GraphError {
  message: string;
  type?: string;
  code?: number;
}

interface GraphResponse<T> {
  id?: string;
  permalink?: string;
  error?: GraphError;
  data?: T;
}

interface InsightMetric {
  name: "impressions" | "reach" | "engagement";
  values: Array<{ value: number }>;
}

type MediaStatus = "IN_PROGRESS" | "PENDING" | "FINISHED" | "ERROR" | "UNKNOWN";

/**
 * Instagram Posting Adapter
 * - No auth validation
 * - No carousel
 * - No post update / delete
 */
export class InstagramPostingAdapter implements PostingAdapter {
  platform = "instagram" as const;
  private readonly baseUrl = "https://graph.instagram.com/v23.0";

  constructor(
    private readonly token: string,
    private readonly igAccountId: string
  ) { }

  // ======================================================
  // Publish
  // ======================================================

  async publish(
    request: PostingPublishRequest
  ): Promise<PostingPublishResponse> {
    try {
      console.log("[Instagram] Publishing post:", {
        hasMedia: !!request.media,
        media: request.media,
        igAccountId: this.igAccountId,
        tokenPrefix: this.token.substring(0, 20) + '...',
        tokenLength: this.token.length
      });

      if (!request.media) {
        return this.fail(
          "Instagram requires at least one image or video"
        );
      }

      const caption = formatMessage(request);

      if (request.media.type === "image") {
        return this.publishImage(caption, request.media.url);
      }

      if (request.media.type === "video") {
        return this.publishVideo(caption, request.media.url);
      }

      console.error("[Instagram] Unsupported media type:", request.media);
      return this.fail(`Unsupported media type: ${request.media.type || 'undefined'}`);
    } catch (error) {
      return this.fail(error);
    }
  }

  // ======================================================
  // Unsupported operations
  // ======================================================

  async update(): Promise<PostingPublishResponse> {
    return this.fail(
      "Instagram does not support editing published posts"
    );
  }

  async delete(): Promise<boolean> {
    // Instagram Graph API does not support deleting posts
    return false;
  }

  // ======================================================
  // Metrics
  // ======================================================

  async getMetrics(postId: string): Promise<PostMetrics> {
    try {
      const post = await this.fbGet<{
        like_count: number;
        comments_count: number;
        insights?: { data: InsightMetric[] };
      }>(`/${postId}`, {
        fields:
          "like_count,comments_count,insights.metric(impressions,reach,engagement)",
      });

      const metrics: PostMetrics = {
        likes: post.like_count ?? 0,
        comments: post.comments_count ?? 0,
        shares: 0,
        views: 0,
        reach: 0,
        engagement: 0,
        lastSyncedAt: new Date(),
      };

      post.insights?.data.forEach((m) => {
        const value = m.values.at(-1)?.value ?? 0;
        if (m.name === "impressions") metrics.views = value;
        if (m.name === "reach") metrics.reach = value;
        if (m.name === "engagement") metrics.engagement = value;
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
  // Internal publish flow
  // ======================================================

  private async publishImage(
    caption: string,
    imageUrl: string
  ): Promise<PostingPublishResponse> {
    const containerId = await this.createContainer({
      image_url: imageUrl,
      caption,
    });

    await this.waitUntilReady(containerId);
    return this.publishContainer(containerId);
  }

  private async publishVideo(
    caption: string,
    videoUrl: string
  ): Promise<PostingPublishResponse> {
    const containerId = await this.createContainer({
      media_type: "VIDEO",
      video_url: videoUrl,
      caption,
    });

    await this.waitUntilReady(containerId);
    return this.publishContainer(containerId);
  }

  // ======================================================
  // Graph helpers
  // ======================================================

  private async createContainer(
    params: Record<string, string>
  ): Promise<string> {
    const res = await this.fbPost<GraphResponse<never>>(
      `/${this.igAccountId}/media`,
      params
    );

    if (res.error || !res.id) {
      const errorMsg = res.error?.message ?? "Failed to create media";
      console.error("[Instagram] Create container error:", res.error);

      // Handle OAuth errors specifically
      if (res.error?.code === 190 || res.error?.type === 'OAuthException') {
        throw new Error(
          `Instagram access token is invalid or expired. ` +
          `Please re-connect your Instagram account in Settings > Social Connections. ` +
          `(${errorMsg})`
        );
      }

      throw new Error(errorMsg);
    }

    return res.id;
  }

  private async publishContainer(
    containerId: string
  ): Promise<PostingPublishResponse> {
    const res = await this.fbPost<GraphResponse<never>>(
      `/${this.igAccountId}/media_publish`,
      { creation_id: containerId }
    );

    if (res.error || !res.id) {
      return this.fail(res.error?.message);
    }

    const permalink = await this.fetchPermalink(res.id);

    return {
      success: true,
      postId: res.id,
      permalink,
    };
  }

  private async waitUntilReady(
    containerId: string,
    maxAttempts = 15
  ): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getMediaStatus(containerId);

      if (status === "FINISHED") return;
      if (status === "ERROR") {
        throw new Error("Media processing failed");
      }

      await this.sleep(2000);
    }

    throw new Error("Media processing timeout");
  }

  private async getMediaStatus(
    containerId: string
  ): Promise<MediaStatus> {
    const res = await this.fbGet<{ status_code?: MediaStatus }>(
      `/${containerId}`,
      { fields: "status_code" }
    );

    return res.status_code ?? "UNKNOWN";
  }

  private async fetchPermalink(mediaId: string): Promise<string> {
    const res = await this.fbGet<{ permalink?: string }>(
      `/${mediaId}`,
      { fields: "permalink" }
    );

    return res.permalink ?? `https://www.instagram.com/p/${mediaId}/`;
  }

  // ======================================================
  // Low-level HTTP
  // ======================================================

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

  private async fbPost<T>(
    path: string,
    params: Record<string, string>
  ): Promise<T> {
    const body = new URLSearchParams({
      ...params,
      access_token: this.token,
    });

    const url = `${this.baseUrl}${path}`;
    console.log("[Instagram] API Request:", {
      method: 'POST',
      url,
      params: Object.keys(params),
      bodySize: body.toString().length
    });

    const res = await fetch(url, {
      method: "POST",
      body,
    });

    const json = await res.json() as T;
    console.log("[Instagram] API Response:", {
      status: res.status,
      ok: res.ok,
      hasError: !!(json as any).error
    });

    return json;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  private fail(error?: unknown): PostingPublishResponse {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Instagram error",
    };
  }
}
