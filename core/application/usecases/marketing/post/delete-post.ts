import type { PostService } from "@/core/application/interfaces/marketing/post-service"
import type { Platform } from "@/core/domain/marketing/post"
import type { PostingAdapterFactory } from "@/core/application/interfaces/social/posting-adapter"

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
    const post = await this.postService.getById(request.id);

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    // 1️⃣ Nếu post có đăng lên các nền tảng → gọi API để xóa
    const platformResults: Record<string, boolean> = {};
    let allPlatformsSucceeded = true;

    if (post.platforms && post.platforms.length > 0) {
      for (const platformData of post.platforms) {
        if (platformData.platform && platformData.postId) {
          try {
            const platformService = await this.platformFactory.create(
              platformData.platform as Platform,
              request.userId
            );
            const success = await platformService.delete(platformData.postId);
            platformResults[platformData.platform] = success;
            if (!success) {
              allPlatformsSucceeded = false;
            }
          } catch (err) {
            platformResults[platformData.platform] = false;
            allPlatformsSucceeded = false;
          }
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
