import type { Platform, PostMetrics } from "@/core/domain/marketing/post";
import type { PostingService, PostingPublishRequest, PostingPublishResponse } from "@/core/application/interfaces/marketing/posting-adapter";

/**
 * Base class for posting adapters with common utilities
 */
export abstract class BasePostingAdapter implements PostingService {
  abstract platform: Platform;

  protected log(message: string, data?: any): void {
    const adapterName = this.constructor.name;
    console.log(`[${adapterName}] ${message}`, data || "");
  }

  protected logError(message: string, error: any): void {
    const adapterName = this.constructor.name;
    console.error(`[${adapterName}] ${message}`, {
      error: error.message,
      stack: error.stack,
    });
  }

  protected validateParams(params: Record<string, any>): void {
    for (const [key, value] of Object.entries(params)) {
      if (!value || (typeof value === "string" && value.trim().length === 0)) {
        throw new Error(`${key} is required`);
      }
    }
  }

  protected formatMessage(request: PostingPublishRequest): string {
    let message = "";

    if (request.title) {
      message += request.title;
    }

    if (request.body) {
      message += (message ? "\n\n" : "") + request.body;
    }

    if (request.hashtags && request.hashtags.length > 0) {
      message += (message ? "\n\n" : "") + request.hashtags.map(tag =>
        tag.startsWith('#') ? tag : `#${tag}`
      ).join(' ');
    }

    return message;
  }

  abstract publish(request: PostingPublishRequest): Promise<PostingPublishResponse>;
  abstract update(postId: string, request: PostingPublishRequest): Promise<PostingPublishResponse>;
  abstract delete(postId: string): Promise<boolean>;
  abstract getMetrics(postId: string): Promise<PostMetrics>;
  abstract verifyAuth(): Promise<boolean>;
}
