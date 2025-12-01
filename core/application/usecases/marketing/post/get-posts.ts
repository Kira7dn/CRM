import type { Post } from "@/core/domain/marketing/post"
import type { PostService } from "@/core/application/interfaces/marketing/post-service"

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
