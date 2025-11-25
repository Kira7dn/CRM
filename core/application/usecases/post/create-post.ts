import type { Post, PostMedia, Platform } from "@/core/domain/campaigns/post"
import type { PostService, PostPayload } from "@/core/application/interfaces/post-service"
import type { PlatformIntegrationFactory } from "@/core/application/interfaces/platform-integration-service"

export interface CreatePostResponse {
  post: Post
}

export class CreatePostUseCase {
  constructor(
    private readonly postService: PostService,
    private readonly platformFactory: PlatformIntegrationFactory
  ) { }

  async execute(request: PostPayload): Promise<CreatePostResponse> {
    // 1️⃣ Lưu post vào DB
    const post = await this.postService.create({
      ...request,
      media: request.media ?? []
    });
    console.log("post", post);

    // 2️⃣ Nếu có platform → Publish và cập nhật lại metadata vào DB
    let updatedPost = post;

    if (request.platforms && request.platforms.length > 0) {
      // Sao chép metadata hiện tại để tránh mutate trực tiếp
      const platformsMetadata = [...post.platforms];

      for (const platform of request.platforms) {
        try {
          const platformService = await this.platformFactory.create(platform.platform);
          console.log("platformService", platformService);

          const result = await platformService.publish({
            title: request.title ?? post.title,
            body: request.body,
            media: request.media ?? [],
            hashtags: request.hashtags ?? [],
            mentions: request.mentions ?? [],
            scheduledAt: request.scheduledAt,
          });

          console.log("result", result);

          // Tìm metadata tương ứng trong post.platforms
          const metaIndex = platformsMetadata.findIndex((m) => m.platform === platform.platform);
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
        } catch (error) {
          console.error(`Failed to publish to platform ${platform.platform}:`, error);
        }
      }

      // Lưu lại metadata platform đã cập nhật vào DB
      const persisted = await this.postService.update({
        id: post.id,
        platforms: platformsMetadata,
      });

      if (persisted) {
        updatedPost = persisted;
      }
    }

    return { post: updatedPost };
  }
}
