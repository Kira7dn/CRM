import { PostRepository } from "@/infrastructure/repositories/marketing/post-repo"
import type { PostRepo } from "@/core/application/interfaces/marketing/post-repo"

import { GetPostsUseCase } from "@/core/application/usecases/marketing/post/get-posts"
import { CreatePostUseCase } from "@/core/application/usecases/marketing/post/create-post"
import { UpdatePostUseCase } from "@/core/application/usecases/marketing/post/update-post"
import { DeletePostUseCase } from "@/core/application/usecases/marketing/post/delete-post"
import { PublishPostUseCase } from "@/core/application/usecases/marketing/post/publish-post"
import { StoreContentEmbeddingUseCase } from "@/core/application/usecases/marketing/post/content-memory/store-content-embedding"

import type { PostingAdapterFactory } from "@/core/application/interfaces/marketing/posting-adapter"
import { getPostingAdapterFactory } from "@/infrastructure/adapters/social/factories/posting-adapter-factory"

import type { QueueService } from "@/core/application/interfaces/queue-service"
import { QStashAdapter } from "@/infrastructure/queue/qstash-adapter"
import { getStoreContentEmbeddingUseCase } from "../resources/depends"

/**
 * ======================================================
 * Singleton Instances
 * ======================================================
 */
let postRepoInstance: PostRepo | null = null
let queueServiceInstance: QueueService | null = null
let publishPostUseCaseInstance: PublishPostUseCase | null = null

const platformFactoryInstance: PostingAdapterFactory =
  getPostingAdapterFactory()

/**
 * ======================================================
 * Repositories
 * ======================================================
 */
const getPostRepo = async (): Promise<PostRepo> => {
  if (!postRepoInstance) {
    postRepoInstance = new PostRepository()
  }
  return postRepoInstance
}

/**
 * ======================================================
 * Queue Service
 * ======================================================
 */
const getQueueService = (): QueueService => {
  if (!queueServiceInstance) {
    queueServiceInstance = new QStashAdapter()
  }
  return queueServiceInstance
}

/**
 * ======================================================
 * UseCases
 * ======================================================
 */

// 🔹 Get Posts (read-only)
export const getPostsUseCase = async (): Promise<GetPostsUseCase> => {
  const postRepo = await getPostRepo()
  return new GetPostsUseCase(postRepo)
}

// 🔹 Publish Post (IMMEDIATE or SCHEDULED EXECUTION CORE)
export const publishPostUseCase = async (): Promise<PublishPostUseCase> => {
  if (!publishPostUseCaseInstance) {
    const postRepo = await getPostRepo()
    const storeContentEmbeddingUseCase = getStoreContentEmbeddingUseCase()
    publishPostUseCaseInstance = new PublishPostUseCase(
      postRepo,
      platformFactoryInstance,
      storeContentEmbeddingUseCase
    )
  }
  return publishPostUseCaseInstance
}

// 🔹 Create Post (CREATE + SCHEDULE OR IMMEDIATE PUBLISH)
export const createPostUseCase = async (): Promise<CreatePostUseCase> => {
  const postRepo = await getPostRepo()
  const queueService = getQueueService()
  const publishUseCase = await publishPostUseCase()

  return new CreatePostUseCase(
    postRepo,
    queueService,
    publishUseCase
  )
}

// 🔹 Update Post (update DB + optional reschedule / republish)
export const updatePostUseCase = async (): Promise<UpdatePostUseCase> => {
  const postRepo = await getPostRepo()
  const queueService = getQueueService()

  return new UpdatePostUseCase(
    postRepo,
    platformFactoryInstance,
    queueService
  )
}

// 🔹 Delete Post (delete DB + revoke external posts)
export const deletePostUseCase = async (): Promise<DeletePostUseCase> => {
  const postRepo = await getPostRepo()
  return new DeletePostUseCase(
    postRepo,
    platformFactoryInstance
  )
}
