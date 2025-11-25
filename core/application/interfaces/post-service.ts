import type { Post } from "@/core/domain/campaigns/post"

export interface PostPayload extends Partial<Post> { }

export interface PostService {
  getAll(): Promise<Post[]>
  getById(id: string): Promise<Post | null>
  create(payload: PostPayload): Promise<Post>
  update(payload: PostPayload & { id: string }): Promise<Post | null>
  delete(id: string): Promise<boolean>
}
