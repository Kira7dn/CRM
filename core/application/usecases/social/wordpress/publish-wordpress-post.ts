import { WordPressPostingAdapter } from "@/infrastructure/adapters/external/social/posting/wordpress-posting-adapter";
import type { PostingPublishRequest } from "@/core/application/interfaces/social/posting-adapter";
import type { SocialAuthService } from "@/core/application/interfaces/social/social-auth-service";
import { ObjectId } from "mongodb";

/**
 * Publish WordPress Post Use Case
 * Publishes a post to WordPress site using stored authentication
 */

export interface PublishWordPressPostRequest {
  userId: string;
  post: {
    title: string;
    content: string;
    status?: "publish" | "draft" | "pending" | "private";
    excerpt?: string;
    featured_media?: number;
    categories?: number[];
    tags?: number[];
  };
}

export interface PublishWordPressPostResponse {
  success: boolean;
  wordpressPostId?: number;
  wordpressData?: any;
  error?: string;
}

export class PublishWordPressPostUseCase {
  constructor(private socialAuthService: SocialAuthService) { }

  async execute(request: PublishWordPressPostRequest): Promise<PublishWordPressPostResponse> {
    try {
      // Get WordPress authentication
      const auth = await this.socialAuthService.getByUserAndPlatform(
        new ObjectId(request.userId),
        "wordpress"
      );

      if (!auth) {
        return {
          success: false,
          error: "WordPress authentication not found",
        };
      }

      // Create adapter using factory
      const { getPostingAdapterFactory } = await import("@/infrastructure/adapters/external/social/factories/posting-adapter-factory");
      const factory = getPostingAdapterFactory();
      const adapter = await factory.create("wordpress", request.userId);

      // Convert request to PostingPublishRequest
      const publishRequest: PostingPublishRequest = {
        title: request.post.title,
        body: request.post.content,
        hashtags: [],
        mentions: [],
        media: [],
      };

      // Publish using adapter
      const result = await adapter.publish(publishRequest);

      return {
        success: result.success,
        wordpressPostId: result.success ? parseInt(result.postId || "0") : undefined,
        wordpressData: result.success ? { postId: result.postId, permalink: result.permalink } : undefined,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
