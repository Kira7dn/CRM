import { PostRepository } from "@/infrastructure/repositories/post-repo"

const postRepository = new PostRepository()

export async function deletePostUseCase(id: string) {
  return postRepository.delete(id)
}
