import type { PostMetrics, PostMedia } from "@/core/domain/marketing/post";
import type { FacebookAuthService } from "../auth/facebook-auth-service";
import { BasePostingAdapter } from "./base-posting-service";
import type { PostingPublishRequest, PostingPublishResponse } from "@/core/application/interfaces/social/posting-adapter";

interface FacebookPostResponse {
  id: string;
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

interface FacebookInsightsResponse {
  data: Array<{
    name: string;
    values: Array<{
      value: number;
    }>;
  }>;
}

/**
 * Facebook Posting Adapter
 * Handles publishing content to Facebook Pages
 */
export class FacebookPostingAdapter extends BasePostingAdapter {
  platform = "facebook" as const;
  private baseUrl = "https://graph.facebook.com/v19.0";

  constructor(private auth: FacebookAuthService) {
    super();
  }

  async publish(request: PostingPublishRequest): Promise<PostingPublishResponse> {
    try {
      if (!request.title && !request.body) {
        return {
          success: false,
          error: "Title or body is required for Facebook post",
        };
      }

      const message = this.formatMessage(request);

      if (request.media.length > 0) {
        return await this.publishWithMedia(message, request.media);
      } else {
        return await this.publishTextPost(message);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async update(postId: string, request: PostingPublishRequest): Promise<PostingPublishResponse> {
    try {
      const message = this.formatMessage(request);

      const url = `${this.baseUrl}/${postId}`;
      const params = new URLSearchParams({
        message,
        access_token: this.auth.getAccessToken(),
      });

      const response = await fetch(url, {
        method: "POST",
        body: params,
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
        postId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async verifyAuth(): Promise<boolean> {
    return await this.auth.verifyAuth();
  }

  async delete(postId: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/${postId}`;
      const params = new URLSearchParams({
        access_token: this.auth.getAccessToken(),
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        method: "DELETE",
      });

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      this.logError("Failed to delete Facebook post", error);
      return false;
    }
  }

  async getMetrics(postId: string): Promise<PostMetrics> {
    try {
      const url = `${this.baseUrl}/${postId}`;
      const params = new URLSearchParams({
        fields: "reactions.summary(true),shares,comments.summary(true)",
        access_token: this.auth.getAccessToken(),
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();

      // Get insights for views and reach
      const insightsUrl = `${this.baseUrl}/${postId}/insights`;
      const insightsParams = new URLSearchParams({
        metric: "post_impressions,post_impressions_unique,post_engaged_users",
        access_token: this.auth.getAccessToken(),
      });

      const insightsResponse = await fetch(`${insightsUrl}?${insightsParams.toString()}`);
      const insightsData: FacebookInsightsResponse = await insightsResponse.json();

      const metrics: PostMetrics = {
        likes: data.reactions?.summary?.total_count || 0,
        comments: data.comments?.summary?.total_count || 0,
        shares: data.shares?.count || 0,
        views: 0,
        reach: 0,
        engagement: 0,
        lastSyncedAt: new Date(),
      };

      if (insightsData.data) {
        insightsData.data.forEach((metric) => {
          const value = metric.values[0]?.value || 0;
          switch (metric.name) {
            case "post_impressions":
              metrics.views = value;
              break;
            case "post_impressions_unique":
              metrics.reach = value;
              break;
            case "post_engaged_users":
              metrics.engagement = value;
              break;
          }
        });
      }

      return metrics;
    } catch (error) {
      this.logError("Failed to get Facebook metrics", error);
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

  private async publishTextPost(message: string): Promise<PostingPublishResponse> {
    const url = `${this.baseUrl}/${this.auth.getPageId()}/feed`;
    const params = new URLSearchParams({
      message,
      access_token: this.auth.getAccessToken(),
    });

    const response = await fetch(url, {
      method: "POST",
      body: params,
    });

    const data: FacebookPostResponse = await response.json();

    if (data.error) {
      return {
        success: false,
        error: data.error.message,
      };
    }

    return {
      success: true,
      postId: data.id,
      permalink: `https://facebook.com/${data.id}`,
    };
  }

  private async publishWithMedia(message: string, media: PostMedia[]): Promise<PostingPublishResponse> {
    try {
      const firstMedia = media[0];

      if (media.length === 1 && firstMedia.type === "image") {
        return await this.publishPhoto(message, firstMedia.url);
      } else if (media.length === 1 && firstMedia.type === "video") {
        return await this.publishVideo(message, firstMedia.url);
      } else if (media.length > 1) {
        return await this.publishCarousel(message, media);
      }

      return {
        success: false,
        error: "Unsupported media configuration",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async publishPhoto(message: string, photoUrl: string): Promise<PostingPublishResponse> {
    const url = `${this.baseUrl}/${this.auth.getPageId()}/photos`;
    const params = new URLSearchParams({
      url: photoUrl,
      message,
      access_token: this.auth.getAccessToken(),
    });

    const response = await fetch(url, {
      method: "POST",
      body: params,
    });

    const data: FacebookPostResponse = await response.json();

    if (data.error) {
      return {
        success: false,
        error: data.error.message,
      };
    }

    return {
      success: true,
      postId: data.id,
      permalink: `https://facebook.com/${data.id}`,
    };
  }

  private async publishVideo(message: string, videoUrl: string): Promise<PostingPublishResponse> {
    const url = `${this.baseUrl}/${this.auth.getPageId()}/videos`;
    const params = new URLSearchParams({
      file_url: videoUrl,
      description: message,
      access_token: this.auth.getAccessToken(),
    });

    const response = await fetch(url, {
      method: "POST",
      body: params,
    });

    const data: FacebookPostResponse = await response.json();

    if (data.error) {
      return {
        success: false,
        error: data.error.message,
      };
    }

    return {
      success: true,
      postId: data.id,
      permalink: `https://facebook.com/${data.id}`,
    };
  }

  private async publishCarousel(message: string, media: PostMedia[]): Promise<PostingPublishResponse> {
    try {
      const uploadedPhotoIds: string[] = [];

      for (const item of media) {
        if (item.type === "image") {
          const photoId = await this.uploadMedia(item);
          uploadedPhotoIds.push(photoId);
        }
      }

      const url = `${this.baseUrl}/${this.auth.getPageId()}/feed`;
      const params = new URLSearchParams({
        message,
        attached_media: JSON.stringify(uploadedPhotoIds.map((id) => ({ media_fbid: id }))),
        access_token: this.auth.getAccessToken(),
      });

      const response = await fetch(url, {
        method: "POST",
        body: params,
      });

      const data: FacebookPostResponse = await response.json();

      if (data.error) {
        return {
          success: false,
          error: data.error.message,
        };
      }

      return {
        success: true,
        postId: data.id,
        permalink: `https://facebook.com/${data.id}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async uploadMedia(media: PostMedia): Promise<string> {
    try {
      const url = `${this.baseUrl}/${this.auth.getPageId()}/photos`;
      const params = new URLSearchParams({
        url: media.url,
        published: "false",
        access_token: this.auth.getAccessToken(),
      });

      const response = await fetch(url, {
        method: "POST",
        body: params,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      return data.id;
    } catch (error) {
      throw new Error(`Failed to upload media: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  protected formatMessage(request: PostingPublishRequest): string {
    let message = super.formatMessage(request);

    if (request.mentions && request.mentions.length > 0) {
      message += "\n" + request.mentions.map((mention) => `@${mention}`).join(" ");
    }

    return message;
  }
}
