import type { Post, Platform, PostStatus, PlatformMetadata } from "@/core/domain/marketing/post"
import type { PostService, PostPayload } from "@/core/application/interfaces/marketing/post-service"
import type { PostingAdapterFactory } from "@/core/application/interfaces/social/posting-adapter"
import type { QueueService } from "@/core/application/interfaces/shared/queue-service"

export interface UpdatePostRequest extends Omit<PostPayload, 'media'> {
  id: string;
  userId: string; // Required for platform authentication
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
    private readonly platformFactory: PostingAdapterFactory,
    private readonly queueService: QueueService
  ) { }

  async execute(request: UpdatePostRequest): Promise<UpdatePostResponse> {
    // 1️⃣ Lấy post hiện tại để kiểm tra trạng thái scheduling
    const existingPost = await this.postService.getById(request.id);
    if (!existingPost) {
      return { post: null, error: "Post not found" };
    }

    // 2️⃣ Xử lý cập nhật scheduled job nếu có thay đổi scheduleAt
    let updatedPlatforms = existingPost.platforms;
    const hasScheduleChange = request.scheduledAt !== undefined &&
      request.scheduledAt !== existingPost.scheduledAt;

    if (hasScheduleChange) {
      console.log(`[UpdatePostUseCase] Schedule changed from ${existingPost.scheduledAt} to ${request.scheduledAt}`);

      // Xóa các scheduled jobs cũ cho tất cả platforms
      for (const platformMeta of existingPost.platforms) {
        if (platformMeta.scheduledJobId) {
          console.log(`[UpdatePostUseCase] Removing old scheduled job ${platformMeta.scheduledJobId} for platform ${platformMeta.platform}`);
          await this.queueService.removeJob("scheduled-posts", platformMeta.scheduledJobId);
        }
      }

      // Nếu có scheduleAt mới và là trong tương lai, tạo job mới
      if (request.scheduledAt && new Date(request.scheduledAt) > new Date()) {
        const delay = new Date(request.scheduledAt).getTime() - Date.now();

        // Tạo job mới cho mỗi platform
        updatedPlatforms = await Promise.all(existingPost.platforms.map(async (platformMeta: PlatformMetadata) => {
          const jobId = await this.queueService.addJob(
            "scheduled-posts",
            "publish-scheduled-post",
            {
              postId: existingPost.id,
              userId: request.userId,
              platforms: [{ platform: platformMeta.platform }],
            },
            { delay }
          );

          console.log(`[UpdatePostUseCase] ✓ Created new job ${jobId} for platform ${platformMeta.platform} with delay ${delay}ms`);

          return {
            ...platformMeta,
            status: "scheduled" as PostStatus,
            scheduledJobId: jobId,
          };
        }));
      } else {
        // Nếu không có scheduleAt mới hoặc scheduleAt trong quá khứ, cập nhật status
        updatedPlatforms = existingPost.platforms.map((platformMeta: PlatformMetadata) => ({
          ...platformMeta,
          status: request.scheduledAt ? "published" as PostStatus : "draft" as PostStatus,
          scheduledJobId: undefined,
        }));
      }
    }

    // 3️⃣ Update trong database với platforms đã được cập nhật
    const post = await this.postService.update({
      ...request,
      media: request.media ?? [],
      platforms: updatedPlatforms,
    });

    if (!post) {
      return { post: null, error: "Post not found or update failed" };
    }

    // 4️⃣ Nếu không cần sync lên platform hoặc không có platform
    if (!request.syncToPlatform || !request.platform) {
      return { post };
    }

    try {
      // 5️⃣ Lấy service tương ứng với platform
      const platformService = await this.platformFactory.create(
        request.platform,
        request.userId
      );

      // 6️⃣ Gửi request update lên platform
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
