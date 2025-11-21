import type { Post } from "@/core/domain/managements/post"
import type { PostService, PostPayload } from "@/core/application/interfaces/post-service"

export interface CreatePostRequest extends PostPayload { }

export interface CreatePostResponse {
  post: Post
}

export class CreatePostUseCase {
  constructor(private postService: PostService) { }

  async execute(request: CreatePostRequest): Promise<CreatePostResponse> {
    const post = await this.postService.create(request)
    return { post }
  }
}
