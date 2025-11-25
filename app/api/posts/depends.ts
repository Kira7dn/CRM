import { PostRepository } from "@/infrastructure/repositories/post-repo";
import type { PostService } from "@/core/application/interfaces/post-service";

import { GetPostsUseCase } from "@/core/application/usecases/post/get-posts";
import { CreatePostUseCase } from "@/core/application/usecases/post/create-post";
import { UpdatePostUseCase } from "@/core/application/usecases/post/update-post";
import { DeletePostUseCase } from "@/core/application/usecases/post/delete-post";

import type { PlatformIntegrationFactory } from "@/core/application/interfaces/platform-integration-service";
import { getPlatformFactory } from "@/infrastructure/adapters/posts";

// Khởi tạo các dependencies một lần duy nhất
let postServiceInstance: PostService | null = null;
const platformFactoryInstance: PlatformIntegrationFactory = getPlatformFactory();

/**
 * Lấy hoặc tạo mới instance của PostService
 */
const getPostService = async (): Promise<PostService> => {
  if (!postServiceInstance) {
    postServiceInstance = new PostRepository();
  }
  return postServiceInstance;
};

// 🔹 UseCase: Get Posts (không cần platform integration)
export const getPostsUseCase = async (): Promise<GetPostsUseCase> => {
  const postService = await getPostService();
  return new GetPostsUseCase(postService);
};

// 🔹 UseCase: Create Post (có publish external platform)
export const createPostUseCase = async (): Promise<CreatePostUseCase> => {
  const postService = await getPostService();
  return new CreatePostUseCase(postService, platformFactoryInstance);
};

// 🔹 UseCase: Update Post (có update external platform)
export const updatePostUseCase = async (): Promise<UpdatePostUseCase> => {
  const postService = await getPostService();
  return new UpdatePostUseCase(postService, platformFactoryInstance);
};

// 🔹 UseCase: Delete Post (có delete external platform)
export const deletePostUseCase = async (): Promise<DeletePostUseCase> => {
  const postService = await getPostService();
  return new DeletePostUseCase(postService, platformFactoryInstance);
};
