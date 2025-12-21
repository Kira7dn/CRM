"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createPostUseCase } from "@/app/api/posts/depends"
import type { Platform, ContentType } from "@/core/domain/marketing/post"

/**
 * Save schedule items as draft posts
 */
export async function createPlanAction(scheduleItems: Array<{
  title: string
  idea: string
  scheduledDate: string
  platform: string
}>) {
  try {
    const cookieStore = await cookies()
    const userIdCookie = cookieStore.get("admin_user_id")
    if (!userIdCookie) {
      throw new Error("Unauthorized - Please login first")
    }

    const useCase = await createPostUseCase()
    const results = []
    const errors = []

    for (const item of scheduleItems) {
      try {
        // Parse scheduled date (YYYY-MM-DD format)
        const [year, month, day] = item.scheduledDate.split('-').map(Number)
        const scheduledAt = new Date(year, month - 1, day, 10, 0, 0) // Default to 10:00 AM

        // Map platform string to Platform type
        const platform = item.platform.toLowerCase() as Platform

        const now = new Date()

        const result = await useCase.execute({
          userId: userIdCookie.value,
          title: item.title,
          body: item.idea, // Use idea as initial body content
          contentType: 'post' as ContentType,
          platforms: [{
            platform,
            status: 'draft' as const,
          }],
          hashtags: [],
          scheduledAt,
          createdAt: now,
          updatedAt: now,
        })

        // Convert ObjectId to string for Client Component serialization
        results.push({
          success: true,
          postId: String(result.id),
          title: item.title
        })
      } catch (error) {
        console.error(`[SaveSchedule] Failed to save item "${item.title}":`, error)
        errors.push({ title: item.title, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    revalidatePath("/crm/posts")

    return {
      success: true,
      savedCount: results.length,
      failedCount: errors.length,
      results,
      errors
    }
  } catch (error) {
    console.error("[SaveSchedule] Action error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save schedule"
    }
  }
}
