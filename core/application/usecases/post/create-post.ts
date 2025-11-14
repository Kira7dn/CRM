import type { Post } from "@/core/domain/post"
import { PostRepository } from "@/infrastructure/repositories/post-repo"

const postRepository = new PostRepository()

export async function createPostUseCase(data: Omit<Post, "id">) {
  return postRepository.create(data)
}
