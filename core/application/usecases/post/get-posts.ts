import type { Post } from "@/core/domain/post"
import type { PostService } from "@/core/application/interfaces/post-service"
import { PostRepository } from "@/infrastructure/repositories/post-repo"

const postRepository = new PostRepository()

export async function getPostsUseCase(repo: PostService = postRepository): Promise<Post[]> {
  return repo.getAll()
}
