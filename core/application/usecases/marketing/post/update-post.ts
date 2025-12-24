import type { Post, PlatformMetadata, PostMedia } from "@/core/domain/marketing/post"
import type { PostRepo, PostPayload } from "@/core/application/interfaces/marketing/post-repo"
import type { PostingAdapterFactory } from "@/core/application/interfaces/marketing/posting-adapter"
import type { QueueService } from "@/core/application/interfaces/queue-service"

export interface UpdatePostResponse {
  post: Post | null;
  platformUpdated?: boolean;
  error?: string;
}

export class UpdatePostUseCase {
  constructor(
    private readonly postRepo: PostRepo,
    private readonly platformFactory: PostingAdapterFactory,
    private readonly queueService: QueueService
  ) { }

  async execute(request: PostPayload): Promise<UpdatePostResponse> {
    // Validation
    if (!request.id || request.id.trim() === "") {
      return { post: null, error: "Post ID is required and cannot be empty" }
    }

    // Check if post exists
    const before = await this.postRepo.getById(request.id)
    if (!before) {
      return { post: null, error: `Post not found with ID: ${request.id}` }
    }

    // ---------- 1️⃣ Scheduling ----------
    const nextScheduledAt =
      request.scheduledAt === undefined
        ? before.scheduledAt
        : request.scheduledAt

    const scheduleChanged =
      String(nextScheduledAt ?? "") !== String(before.scheduledAt ?? "")

    let platforms = request.platforms && request.platforms.length > 0
      ? request.platforms
      : before.platforms

    // Check if any platform status changed to/from 'scheduled'
    const hadScheduledPlatform = before.platforms.some(p => p.status === 'scheduled')
    const hasScheduledPlatform = platforms.some(p => p.status === 'scheduled')
    const platformScheduleChanged = hadScheduledPlatform !== hasScheduledPlatform

    console.log("[UpdatePostUseCase] Schedule check:", {
      before: before.scheduledAt,
      next: nextScheduledAt,
      scheduleChanged,
      hadScheduledPlatform,
      hasScheduledPlatform,
      platformScheduleChanged,
      shouldUpdateQueue: scheduleChanged || platformScheduleChanged
    })

    if (scheduleChanged || platformScheduleChanged) {
      // luôn remove theo postId (chuẩn với CreatePostUseCase)
      await this.queueService.removeJob("scheduled-posts", before.id)

      const isScheduled =
        !!nextScheduledAt && new Date(nextScheduledAt) > new Date()

      // Only auto-update platform status if NOT explicitly provided in request
      // If user explicitly set platform.status (e.g. saveDraft sets to 'draft'), respect that
      if (!request.platforms || request.platforms.length === 0) {
        platforms = platforms.map(p => ({
          ...p,
          status: isScheduled ? "scheduled" : "draft",
        }))
      }

      // Add job to queue if platforms are scheduled AND scheduledAt is in future
      const shouldAddJob = hasScheduledPlatform && isScheduled

      if (shouldAddJob) {
        const delay =
          new Date(nextScheduledAt).getTime() - Date.now()

        await this.queueService.addJob(
          "scheduled-posts",
          "publish-scheduled-post",
          {
            postId: before.id,
            userId: before.userId,
          },
          {
            delay,
            jobId: before.id, // ✅ invariant
          } as any
        )
      }
    }

    // ---------- 2️⃣ Update DB ----------
    console.log("[UpdatePostUseCase] Final platforms before update:", platforms)

    let after: Post | null = null
    try {
      after = await this.postRepo.update({
        id: before.id,
        idea: request.idea ?? before.idea,
        title: request.title ?? before.title,
        body: request.body ?? before.body,
        contentType: request.contentType ?? before.contentType,
        media: request.media ?? before.media,
        hashtags: request.hashtags ?? before.hashtags,
        mentions: request.mentions ?? before.mentions,
        scheduledAt: nextScheduledAt,
        platforms,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown database error"
      console.error("[UpdatePostUseCase] Database error:", error)
      return {
        post: null,
        error: `Database update failed: ${errorMessage}`
      }
    }

    console.log("[UpdatePostUseCase] After update:", after)

    if (!after) {
      return {
        post: null,
        error: "Database update failed: Repository returned null. Post may have been deleted or database connection lost."
      }
    }

    // ---------- 3️⃣ Optional: sync published platforms ----------
    const syncPlan = buildPlatformSyncPlan(before, after)
    if (!syncPlan.payload || syncPlan.platforms.length === 0) {
      return { post: after, platformUpdated: false }
    }

    let platformUpdated = false
    let lastError: string | undefined

    if (!after.userId) {
      return {
        post: after,
        platformUpdated: false,
        error: "User ID is required for platform update",
      }
    }

    for (const meta of syncPlan.platforms) {
      try {
        const service = await this.platformFactory.create(
          meta.platform,
          after.userId
        )

        const result = await service.update(meta.postId!, {
          title: syncPlan.payload.title ?? "",
          body: syncPlan.payload.body,
          media: syncPlan.payload.media,
          hashtags: syncPlan.payload.hashtags ?? [],
          mentions: syncPlan.payload.mentions ?? [],
        })

        platformUpdated ||= result.success
        meta.error = result.success ? undefined : result.error

        if (!result.success) {
          const platformError = `${meta.platform} update failed: ${result.error || "Unknown error"}`
          console.warn(`[UpdatePostUseCase] ${platformError}`)
          lastError = lastError
            ? `${lastError}; ${platformError}`
            : platformError
        }
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "Unknown error"
        const platformError = `${meta.platform} update exception: ${errorMsg}`
        console.error(`[UpdatePostUseCase]`, e)
        meta.error = errorMsg
        lastError = lastError
          ? `${lastError}; ${platformError}`
          : platformError
      }
    }

    // Update platform metadata with error states
    try {
      await this.postRepo.update({
        id: after.id,
        platforms: after.platforms,
      })
    } catch (error) {
      console.error("[UpdatePostUseCase] Failed to update platform metadata:", error)
      // Don't fail the entire operation if metadata update fails
    }

    return {
      post: after,
      platformUpdated,
      error: lastError,
    }
  }
}

interface PlatformSyncPlan {
  platforms: PlatformMetadata[]
  payload: {
    title?: string
    body?: string
    media?: PostMedia
    hashtags?: string[]
    mentions?: string[]
  } | null
}
function buildPlatformSyncPlan(
  before: Post,
  after: Post
): PlatformSyncPlan {
  const payload: NonNullable<PlatformSyncPlan["payload"]> = {}

  if (before.title !== after.title) payload.title = after.title
  if (before.body !== after.body) payload.body = after.body
  if (!shallowEqual(before.media, after.media)) payload.media = after.media
  if (!arrayEqual(before.hashtags, after.hashtags)) payload.hashtags = after.hashtags
  if (!arrayEqual(before.mentions, after.mentions)) payload.mentions = after.mentions

  if (Object.keys(payload).length === 0) {
    return { platforms: [], payload: null }
  }

  return {
    payload,
    platforms: after.platforms.filter(
      p => p.status === "published" && !!p.postId
    ),
  }
}

// --- utils ---
const shallowEqual = (a: any, b: any) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

const arrayEqual = (a?: any[], b?: any[]) =>
  JSON.stringify(a ?? []) === JSON.stringify(b ?? [])
