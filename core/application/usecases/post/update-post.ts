import type { Post, Platform } from "@/core/domain/campaigns/post"
import type { PostService, PostPayload } from "@/core/application/interfaces/post-service"
import type { PlatformIntegrationFactory } from "@/core/application/interfaces/platform-integration-service"

export interface UpdatePostRequest extends Omit<PostPayload, 'media'> {
  id: string;
  platform?: Platform;
  media?: any[];
  syncToPlatform?: boolean;
}

export interface UpdatePostResponse {
  post: Post | null;
  platformUpdated?: boolean;
  error?: string;
}

export class UpdatePostUseCase {
  constructor(
    private readonly postService: PostService,
    private readonly platformFactory: PlatformIntegrationFactory
  ) { }

  async execute(request: UpdatePostRequest): Promise<UpdatePostResponse> {
    // 1️⃣ Update trong database
    const post = await this.postService.update({
      ...request,
      media: request.media ?? []
    });

    if (!post) {
      return { post: null, error: "Post not found or update failed" };
    }

    // 2️⃣ Nếu không cần sync lên platform hoặc không có platform
    if (!request.syncToPlatform || !request.platform) {
      return { post };
    }

    try {
      // 3️⃣ Lấy service tương ứng với platform
      const platformService = await this.platformFactory.create(request.platform);

      // 4️⃣ Gửi request update lên platform
      const platformMeta = post.platforms.find((p) => p.platform === request.platform);

      if (!platformMeta || !platformMeta.postId) {
        return {
          post,
          platformUpdated: false,
          error: "Post does not have a platform postId for the specified platform",
        };
      }

      const result = await platformService.update(platformMeta.postId, {
        title: request.title ?? post.title,
        body: request.body ?? post.body,
        media: (request.media as any[]) ?? post.media,
        hashtags: request.hashtags ?? post.hashtags,
        mentions: request.mentions ?? post.mentions,
        scheduledAt: request.scheduledAt ?? post.scheduledAt,
      });

      // Cập nhật lại metadata cho platform tương ứng
      const platformsMetadata = [...post.platforms];
      const metaIndex = platformsMetadata.findIndex((m) => m.platform === request.platform);
      if (metaIndex !== -1) {
        const currentMeta = platformsMetadata[metaIndex];
        platformsMetadata[metaIndex] = {
          ...currentMeta,
          postId: result.postId ?? currentMeta.postId,
          permalink: result.permalink ?? currentMeta.permalink,
          status: result.success ? "published" : "failed",
          publishedAt: result.success ? new Date() : currentMeta.publishedAt,
          error: result.success ? undefined : (result.error ?? currentMeta.error),
        };
      }

      const persisted = await this.postService.update({
        id: post.id,
        platforms: platformsMetadata,
      });

      return {
        post: persisted ?? post,
        platformUpdated: result.success,
        error: result.success ? undefined : result.error,
      };
    } catch (error) {
      console.error(`Failed to update post on platform ${request.platform}:`, error);
      return {
        post,
        platformUpdated: false,
        error: (error as Error).message
      };
    }
  }
}
