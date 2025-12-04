import { PostRepository } from "@/infrastructure/repositories/marketing/post-repo";
import type { PostService } from "@/core/application/interfaces/marketing/post-service";

import { GetPostsUseCase } from "@/core/application/usecases/marketing/post/get-posts";
import { CreatePostUseCase } from "@/core/application/usecases/marketing/post/create-post";
import { UpdatePostUseCase } from "@/core/application/usecases/marketing/post/update-post";
import { DeletePostUseCase } from "@/core/application/usecases/marketing/post/delete-post";

import type { PostingAdapterFactory } from "@/core/application/interfaces/social/posting-adapter";
import { getPostingAdapterFactory } from "@/infrastructure/adapters/external/social/factories/posting-adapter-factory";
import { BullMQAdapter } from "@/infrastructure/queue/bullmq-adapter";
import type { QueueService } from "@/core/application/interfaces/shared/queue-service";

// Khởi tạo các dependencies một lần duy nhất
let postServiceInstance: PostService | null = null;
let queueServiceInstance: QueueService | null = null;
const platformFactoryInstance: PostingAdapterFactory = getPostingAdapterFactory();

/**
 * Lấy hoặc tạo mới instance của PostService
 */
const getPostService = async (): Promise<PostService> => {
  if (!postServiceInstance) {
    postServiceInstance = new PostRepository();
  }
  return postServiceInstance;
};

/**
 * Lấy hoặc tạo mới instance của QueueService
 */
const getQueueService = (): QueueService => {
  if (!queueServiceInstance) {
    queueServiceInstance = new BullMQAdapter();
  }
  return queueServiceInstance;
};

// 🔹 UseCase: Get Posts (không cần platform integration)
export const getPostsUseCase = async (): Promise<GetPostsUseCase> => {
  const postService = await getPostService();
  return new GetPostsUseCase(postService);
};

// 🔹 UseCase: Create Post (có publish external platform + queue scheduling)
export const createPostUseCase = async (): Promise<CreatePostUseCase> => {
  const postService = await getPostService();
  const queueService = getQueueService();
  return new CreatePostUseCase(postService, platformFactoryInstance, queueService);
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
