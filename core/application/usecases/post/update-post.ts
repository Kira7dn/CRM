import type { Post } from "@/core/domain/post"
import { PostRepository } from "@/infrastructure/repositories/post-repo"

const postRepository = new PostRepository()

export async function updatePostUseCase(id: string, data: Partial<Post>) {
  return postRepository.update({ id, ...data })
}
