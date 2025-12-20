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

    const platforms = payload.platforms?.map(p => ({
      platform: p.platform,
      status: (isScheduled ? "scheduled" : "draft") as PostStatus,
    })) ?? []

    // 1️⃣ Create post
    const post = await this.postRepo.create({
      ...payload,
      platforms,
    })

    // 2️⃣ Scheduled → enqueue
    if (isScheduled) {
      const delay =
        new Date(payload.scheduledAt!).getTime() - Date.now()

      await this.queueService.addJob(
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
