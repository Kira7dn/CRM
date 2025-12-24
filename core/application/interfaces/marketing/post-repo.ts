import type { Post } from "@/core/domain/marketing/post"
import type { PaginationOptions, PaginatedResult } from "@/infrastructure/db/base-repository"

// PostPayload for API/Server Actions
// Note: scheduledAt can be string (ISO) from frontend or Date from domain
export interface PostPayload extends Partial<Post> {
  scheduledAt?: string | Date
}

export interface DateRangeFilter {
  startDate: Date
  endDate: Date
}

export interface PostRepo {
  getAll(options?: PaginationOptions): Promise<Post[]>
  getAllPaginated(options?: PaginationOptions): Promise<PaginatedResult<Post>>
  getByDateRange(filter: DateRangeFilter): Promise<Post[]>
  getById(id: string): Promise<Post | null>
  create(payload: PostPayload): Promise<Post>
  update(payload: PostPayload & { id: string }): Promise<Post | null>
  delete(id: string): Promise<boolean>
}
