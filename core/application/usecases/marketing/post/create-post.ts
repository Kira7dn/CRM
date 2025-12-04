import type { Post, PostMedia, Platform, PlatformMetadata } from "@/core/domain/marketing/post"
import type { PostService, PostPayload } from "@/core/application/interfaces/marketing/post-service"
import type { PostingAdapterFactory } from "@/core/application/interfaces/social/posting-adapter"
import type { QueueService } from "@/core/application/interfaces/shared/queue-service"

export interface CreatePostRequest extends PostPayload {
  userId: string; // Required for platform authentication
  saveAsDraft?: boolean; // If true, save as draft without publishing
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
    private readonly platformFactory: PostingAdapterFactory,
    private readonly queueService: QueueService
  ) { }

  async execute(request: CreatePostRequest): Promise<CreatePostResponse> {
    const platformResults: PlatformPublishResult[] = [];
    const platformsMetadata: PlatformMetadata[] = [];

    // Determine post status based on request
    let postStatus: "draft" | "scheduled" | "published" = "draft"

    if (request.saveAsDraft) {
      // Explicitly saving as draft
      postStatus = "draft"
    } else if (request.scheduledAt && new Date(request.scheduledAt) > new Date()) {
      // Scheduled for future
      postStatus = "scheduled"
    } else if (request.platforms && request.platforms.length > 0) {
      // Publishing now
      postStatus = "published"
    }

    // 1️⃣ Publish to platforms OR schedule for later
    if (!request.saveAsDraft && request.platforms && request.platforms.length > 0) {

      // NEW: If scheduled, add job to queue instead of publishing immediately
      if (postStatus === "scheduled") {
        const delay = new Date(request.scheduledAt!).getTime() - Date.now()

        // Create post in DB first (needed for worker)
        const post = await this.postService.create({
          title: request.title,
          body: request.body,
          contentType: request.contentType,
          media: request.media,
          hashtags: request.hashtags,
          mentions: request.mentions,
          scheduledAt: request.scheduledAt,
          platforms: request.platforms.map(p => ({
            platform: p.platform,
            status: "scheduled" as const,
            postId: undefined,
            permalink: undefined,
            publishedAt: undefined,
            error: undefined,
          })),
          createdAt: request.createdAt ?? new Date(),
          updatedAt: request.updatedAt ?? new Date(),
        })

        // Add job to queue
        await this.queueService.addJob(
          "scheduled-posts",
          "publish-scheduled-post",
          {
            postId: post.id,
            userId: request.userId,
            platforms: request.platforms,
          },
          { delay }
        )

        console.log(`[CreatePostUseCase] Scheduled job for post ${post.id} with delay ${delay}ms`)

        // Return with scheduled status
        return {
          post,
          platformResults: request.platforms.map(p => ({
            platform: p.platform,
            success: true,
            postId: undefined,
            permalink: undefined,
            error: undefined,
          }))
        }
      }

      // Publish immediately for non-scheduled posts
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
          // Note: Scheduled posts are handled separately and don't reach this code
          const platformStatus = result.success ? "published" : "failed"

          platformsMetadata.push({
            platform: platform.platform,
            postId: result.postId,
            permalink: result.permalink,
            status: platformStatus,
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

    // 2️⃣ Create post in DB with platform results and determined status
    // If we published to platforms, use platformsMetadata with actual results
    // Otherwise, create draft/scheduled metadata for each platform
    const finalPlatformsMetadata: PlatformMetadata[] = platformsMetadata.length > 0
      ? platformsMetadata
      : (request.platforms?.map(p => ({
        platform: p.platform,
        status: postStatus,
        publishedAt: postStatus === "published" ? new Date() : undefined,
      })) ?? []);

    const post = await this.postService.create({
      ...request,
      media: request.media ?? [],
      platforms: finalPlatformsMetadata,
    });

    console.log("Post created in DB with platform results:", post);

    return {
      post,
      platformResults
    };
  }
}
