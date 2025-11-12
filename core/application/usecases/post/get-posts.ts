import type { Post } from "@/core/domain/post"
import type { PostService } from "@/core/application/interfaces/post-service"
import { postRepository } from "@/infrastructure/repositories/post-repo"

export async function getPostsUseCase(repo: PostService = postRepository): Promise<Post[]> {
  return repo.getAll()
}
