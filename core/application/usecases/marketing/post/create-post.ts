import { PostPayload, PostRepo } from "@/core/application/interfaces/marketing/post-repo"
import { QueueService } from "@/core/application/interfaces/queue-service"
import { PublishPostUseCase } from "./publish-post"
import { Post, PostStatus } from "@/core/domain/marketing/post"

export class CreatePostUseCase {
  constructor(
    private readonly postRepo: PostRepo,
    private readonly queueService: QueueService,
    private readonly publishPostUseCase: PublishPostUseCase
  ) { }

  async execute(payload: PostPayload): Promise<Post> {
    const isScheduled =
      !!payload.scheduledAt &&
      new Date(payload.scheduledAt) > new Date()

    // Use provided platform status if available, otherwise auto-set based on scheduledAt
    const platforms = payload.platforms?.map(p => ({
      platform: p.platform,
      status: p.status,
    })) ?? []

    const hasScheduledPlatform = platforms.some(p => p.status === 'scheduled')

    // 1️⃣ Create post
    const post = await this.postRepo.create({
      ...payload,
      platforms,
    })

    // 2️⃣ Scheduled → enqueue (only if platforms are scheduled AND scheduledAt is valid)
    const shouldAddJob = hasScheduledPlatform && isScheduled

    console.log("[CreatePostUseCase] Queue check:", {
      hasScheduledPlatform,
      isScheduled,
      shouldAddJob,
      scheduledAt: payload.scheduledAt,
      platforms
    })

    if (shouldAddJob) {
      const delay =
        new Date(payload.scheduledAt!).getTime() - Date.now()

      console.log("[CreatePostUseCase] Adding job to queue:", {
        postId: post.id,
        delay,
        scheduledAt: payload.scheduledAt
      })

      const queue_result = await this.queueService.addJob(
        "scheduled-posts",
        "publish-scheduled-post",
        {
          postId: post.id,
          userId: payload.userId,
        },
        {
          delay,
          jobId: post.id, // 👈 trùng postId
        } as any
      )

      console.log("queue_result", queue_result);
      return post
    }


    // 3️⃣ Immediate publish
    if (!payload.userId) {
      throw new Error("userId is required to publish")
    }

    await this.publishPostUseCase.execute(post.id, payload.userId)

    return post
  }
}
