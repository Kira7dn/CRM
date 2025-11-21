import type { Post } from "@/core/domain/managements/post"
import type { PostService } from "@/core/application/interfaces/post-service"

export interface GetPostsResponse {
  posts: Post[]
}

export class GetPostsUseCase {
  constructor(private postService: PostService) { }

  async execute(): Promise<GetPostsResponse> {
    const posts = await this.postService.getAll()
    return { posts }
  }
}
