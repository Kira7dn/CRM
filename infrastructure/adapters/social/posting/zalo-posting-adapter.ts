import type { PostMetrics, PostMedia } from "@/core/domain/marketing/post";
import type { PostingAdapter, PostingPublishRequest, PostingPublishResponse } from "@/core/application/interfaces/marketing/posting-adapter";
import { emptyMetrics } from "./utils";

/**
 * Zalo API Response Types
 */
interface ZaloResponse {
  error: number;
  message: string;
  data?: unknown;
}

interface ZaloMessageResponse extends ZaloResponse {
  data?: {
    message_id: string;
  };
}

interface ZaloUploadResponse extends ZaloResponse {
  data?: {
    attachment_id: string;
    url: string;
  };
}

/**
 * Zalo Posting Adapter
 * Handles broadcasting messages to Zalo OA followers
 */
export class ZaloPostingAdapter implements PostingAdapter {
  platform = "zalo" as const;
  private baseUrl = "https://openapi.zalo.me/v2.0";

  constructor(private token: string) { }

  async publish(request: PostingPublishRequest): Promise<PostingPublishResponse> {
    if (!request.title && !request.body) {
      return {
        success: false,
        error: "Title or body is required for Zalo message",
      };
    }

    const message = this.formatMessage(request);

    return request.media
      ? this.publishWithMedia(message, request.media)
      : this.publishText(message);
  }

  async update(): Promise<PostingPublishResponse> {
    return {
      success: false,
      error: "Zalo does not support updating messages",
    };
  }

  async delete(): Promise<boolean> {
    return false;
  }

  async getMetrics(): Promise<PostMetrics> {
    return emptyMetrics();
  }

  // ================= PRIVATE =================

  private async publishText(message: string): Promise<PostingPublishResponse> {
    const followers = await this.getFollowers();
    if (followers.length === 0) {
      return { success: false, error: "No followers available" };
    }

    const messageIds = await this.broadcast(
      followers,
      (userId) => ({
        recipient: { user_id: userId },
        message: { text: message },
      })
    );

    if (!messageIds.length) {
      return { success: false, error: "Failed to send message" };
    }

    return this.success(messageIds[0]);
  }

  private async publishWithMedia(
    message: string,
    media: PostMedia
  ): Promise<PostingPublishResponse> {
    if (media.type !== "image") {
      return {
        success: false,
        error: "Zalo OA only supports image attachments",
      };
    }

    const attachmentId = await this.uploadImage(media.url);
    const followers = await this.getFollowers();

    const messageIds = await this.broadcast(
      followers,
      (userId) => ({
        recipient: { user_id: userId },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "media",
              elements: [
                {
                  media_type: "image",
                  attachment_id: attachmentId,
                },
              ],
            },
          },
        },
      })
    );

    if (!messageIds.length) {
      return { success: false, error: "Failed to send message" };
    }

    return this.success(messageIds[0]);
  }

  private async broadcast(
    followers: string[],
    buildBody: (userId: string) => unknown
  ): Promise<string[]> {
    const url = `${this.baseUrl}/oa/message`;
    const params = new URLSearchParams({ access_token: this.token });

    const sent: string[] = [];

    for (const userId of followers.slice(0, 50)) {
      const res = await fetch(`${url}?${params}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody(userId)),
      });

      const data: ZaloMessageResponse = await res.json();
      if (data.error === 0 && data.data?.message_id) {
        sent.push(data.data.message_id);
      }
    }

    return sent;
  }

  private async uploadImage(imageUrl: string): Promise<string> {
    const res = await fetch(imageUrl);
    const blob = await res.blob();

    const form = new FormData();
    form.append("file", blob);

    const upload = await fetch(
      `${this.baseUrl}/oa/upload/image?access_token=${this.token}`,
      { method: "POST", body: form }
    );

    const data: ZaloUploadResponse = await upload.json();

    if (data.error !== 0 || !data.data?.attachment_id) {
      throw new Error(data.message || "Upload failed");
    }

    return data.data.attachment_id;
  }

  private async getFollowers(): Promise<string[]> {
    const res = await fetch(
      `${this.baseUrl}/oa/getfollowers?access_token=${this.token}&offset=0&count=50`
    );

    const data: {
      error: number;
      data?: { followers: { user_id: string }[] };
    } = await res.json();

    return data.error === 0
      ? data.data?.followers.map((f) => f.user_id) ?? []
      : [];
  }

  private formatMessage(req: PostingPublishRequest): string {
    const parts = [
      req.title,
      req.body,
      req.hashtags?.map((t) => `#${t}`).join(" "),
    ];

    return parts.filter(Boolean).join("\n\n");
  }

  private success(messageId: string): PostingPublishResponse {
    return {
      success: true,
      postId: messageId,
      permalink: "https://oa.zalo.me/",
    };
  }
}

