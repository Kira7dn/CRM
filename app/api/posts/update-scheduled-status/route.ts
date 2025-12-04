import { NextResponse } from "next/server"
import { createPostUseCase } from "../depends"
import { UpdateScheduledPostsStatusUseCase } from "@/core/application/usecases/marketing/post/update-scheduled-posts-status"

/**
 * POST /api/posts/update-scheduled-status
 *
 * Updates scheduled posts to published when their scheduledAt time has passed
 * Should be called by a cron job every 5-10 minutes
 */
export async function POST() {
  try {
    const postUseCase = await createPostUseCase()
    // Access the postService from the use case
    const postService = (postUseCase as any).postService
    const useCase = new UpdateScheduledPostsStatusUseCase(postService)
    const result = await useCase.execute()

    return NextResponse.json({
      success: true,
      updatedCount: result.updatedCount,
      message: `Updated ${result.updatedCount} scheduled posts to published`,
    })
  } catch (error) {
    console.error("[UpdateScheduledStatus] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
