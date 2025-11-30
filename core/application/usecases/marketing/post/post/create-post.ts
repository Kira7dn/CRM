import type { Post, PostMedia, Platform, PlatformMetadata } from "@/core/domain/marketing/post"
import type { PostService, PostPayload } from "@/core/application/interfaces/marketing/post-service"
import type { PostingAdapterFactory } from "@/core/application/interfaces/social/posting-adapter"

export interface CreatePostRequest extends PostPayload {
  userId: string; // Required for platform authentication
}

export interface PlatformPublishResult {
  platform: Platform
  success: boolean
  postId?: string
  permalink?: string
  error?: string
}

export interface CreatePostResponse {
  post: Post
  platformResults: PlatformPublishResult[]
}

export class CreatePostUseCase {
  constructor(
    private readonly postService: PostService,
    private readonly platformFactory: PostingAdapterFactory
  ) { }

  async execute(request: CreatePostRequest): Promise<CreatePostResponse> {
    const platformResults: PlatformPublishResult[] = [];
    const platformsMetadata: PlatformMetadata[] = [];

    // 1️⃣ Upload to platforms FIRST if platforms are specified
    if (request.platforms && request.platforms.length > 0) {
      for (const platform of request.platforms) {
        try {
          const platformService = await this.platformFactory.create(
            platform.platform,
            request.userId
          );

          const result = await platformService.publish({
            title: request.title ?? "",
            body: request.body,
            media: request.media ?? [],
            hashtags: request.hashtags ?? [],
            mentions: request.mentions ?? [],
            scheduledAt: request.scheduledAt,
          });

          // Store result for response
          platformResults.push({
            platform: platform.platform,
            success: result.success,
            postId: result.postId,
            permalink: result.permalink,
            error: result.error,
          });

          // Build platform metadata for DB
          platformsMetadata.push({
            platform: platform.platform,
            postId: result.postId,
            permalink: result.permalink,
            status: result.success ? "published" : "failed",
            publishedAt: result.success ? new Date() : undefined,
            error: result.success ? undefined : result.error,
          });

          console.log(`Published to ${platform.platform}:`, result);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          console.error(`Failed to publish to platform ${platform.platform}:`, error);

          // Store error result
          platformResults.push({
            platform: platform.platform,
            success: false,
            error: errorMessage,
          });

          // Store failed metadata for DB
          platformsMetadata.push({
            platform: platform.platform,
            status: "failed",
            error: errorMessage,
          });
        }
      }
    }

    // 2️⃣ Create post in DB with platform results
    const post = await this.postService.create({
      ...request,
      media: request.media ?? [],
      platforms: platformsMetadata,
    });

    console.log("Post created in DB with platform results:", post);

    return {
      post,
      platformResults
    };
  }
}
