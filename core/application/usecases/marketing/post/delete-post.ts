import type { PostService } from "@/core/application/interfaces/marketing/post-service"
import type { Platform } from "@/core/domain/marketing/post"
import type { PostingAdapterFactory } from "@/core/application/interfaces/marketing/posting-adapter"

export interface DeletePostRequest {
  id: string
  userId: string // Required for platform authentication
}

export interface DeletePostResponse {
  success: boolean
  deletedInCRM?: boolean
  deletedOnPlatforms?: Record<string, boolean>
  error?: string
}

export class DeletePostUseCase {
  constructor(
    private postService: PostService,
    private platformFactory: PostingAdapterFactory
  ) { }

  async execute(request: DeletePostRequest): Promise<DeletePostResponse> {
    console.log(`[DeletePostUseCase] Starting delete for post:`, { postId: request.id, userId: request.userId });

    const post = await this.postService.getById(request.id);

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    console.log(`[DeletePostUseCase] Post found:`, {
      postId: post.id,
      platforms: post.platforms,
      platformCount: post.platforms?.length || 0
    });

    // 1️⃣ Nếu post có đăng lên các nền tảng → gọi API để xóa
    const platformResults: Record<string, boolean> = {};
    let allPlatformsSucceeded = true;

    if (post.platforms && post.platforms.length > 0) {
      for (const platformData of post.platforms) {
        console.log(`[DeletePostUseCase] Processing platform:`, {
          platform: platformData.platform,
          postId: platformData.postId,
          status: platformData.status,
          hasPostId: !!platformData.postId
        });

        if (platformData.platform && platformData.postId) {
          try {
            console.log(`[DeletePostUseCase] Attempting to delete from ${platformData.platform}:`, platformData.postId);
            const platformService = await this.platformFactory.create(
              platformData.platform as Platform,
              request.userId
            );
            const success = await platformService.delete(platformData.postId);
            platformResults[platformData.platform] = success;
            console.log(`[DeletePostUseCase] Delete result for ${platformData.platform}:`, { success });
            if (!success) {
              allPlatformsSucceeded = false;
            }
          } catch (err) {
            console.error(`[DeletePostUseCase] Error deleting from ${platformData.platform}:`, err);
            platformResults[platformData.platform] = false;
            allPlatformsSucceeded = false;
          }
        } else {
          console.log(`[DeletePostUseCase] Skipping delete for ${platformData.platform}:`, {
            reason: !platformData.platform ? 'No platform specified' : 'No postId available',
            postId: platformData.postId
          });
        }
      }
    }

    // 2️⃣ Xóa trong CRM
    const deletedInCRM = await this.postService.delete(request.id);

    return {
      success: deletedInCRM && allPlatformsSucceeded,
      deletedInCRM,
      deletedOnPlatforms: platformResults
    };
  }
}
