import type { Post } from "@/core/domain/post"

export interface PostService {
  getAll(): Promise<Post[]>
}
