import type { Post } from "@/core/domain/post"

export interface PostPayload extends Partial<Post> {}

export interface PostService {
  getAll(): Promise<Post[]>
}
