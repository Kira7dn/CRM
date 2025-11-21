import type { Post } from "@/core/domain/managements/post"
import type { PostService, PostPayload } from "@/core/application/interfaces/post-service"

export interface UpdatePostRequest extends PostPayload {
  id: string
}

export interface UpdatePostResponse {
  post: Post | null
}

export class UpdatePostUseCase {
  constructor(private postService: PostService) { }

  async execute(request: UpdatePostRequest): Promise<UpdatePostResponse> {
    const post = await this.postService.update(request)
    return { post }
  }
}
