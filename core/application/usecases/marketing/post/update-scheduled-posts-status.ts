import type { PostService } from "@/core/application/interfaces/marketing/post-service"

/**
 * Update Scheduled Posts Status Use Case
 *
 * Updates posts with status="scheduled" to status="published"
 * when their scheduledAt time has passed
 */
export class UpdateScheduledPostsStatusUseCase {
  constructor(private readonly postService: PostService) {}

  async execute(): Promise<{ updatedCount: number }> {
    const now = new Date()

    // Get all posts (need to filter scheduled ones)
    const allPosts = await this.postService.getAll()

    let updatedCount = 0

    for (const post of allPosts) {
      // Check if post has scheduledAt and it's in the past
      if (!post.scheduledAt || new Date(post.scheduledAt) > now) {
        continue
      }

      // Check if any platform is still in "scheduled" status
      const hasScheduledPlatform = post.platforms.some(p => p.status === "scheduled")

      if (hasScheduledPlatform) {
        // Update platforms from "scheduled" to "published"
        const updatedPlatforms = post.platforms.map(p => ({
          ...p,
          status: p.status === "scheduled" ? "published" as const : p.status,
          publishedAt: p.status === "scheduled" ? now : p.publishedAt,
        }))

        // Update post in DB
        await this.postService.update({
          id: post.id,
          platforms: updatedPlatforms,
          updatedAt: now,
        })

        updatedCount++
        console.log(`[UpdateScheduledStatus] Updated post ${post.id} to published`)
      }
    }

    console.log(`[UpdateScheduledStatus] Updated ${updatedCount} scheduled posts to published`)

    return { updatedCount }
  }
}
