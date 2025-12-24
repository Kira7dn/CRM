"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createPostUseCase } from "@/app/api/posts/depends"
import type { Platform, ContentType, Post } from "@/core/domain/marketing/post"
import { calendarDateWithLocalTime } from "@/lib/date-utils"

interface PostScheduleItem {
  idea: string
  scheduledDate: string // YYYY-MM-DD format
}

/**
 * Save schedule items as draft posts
 */
export async function createPlanAction(scheduleItems: Array<PostScheduleItem>) {
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
        // Parse scheduled date (YYYY-MM-DD format) - CRM Date Standard
        const [year, month, day] = item.scheduledDate.split('-').map(Number)
        // Default publish time: 8:00 PM local time (20:00)
        const scheduledAtISO = calendarDateWithLocalTime(year, month, day, 20, 0)
        const scheduledAt = new Date(scheduledAtISO)

        const result = await useCase.execute({
          userId: userIdCookie.value,
          idea: item.idea,
          title: item.idea,
          contentType: 'post' as ContentType,
          scheduledAt,
        })

        results.push({
          success: true,
          ...result
        })
      } catch (error) {
        console.error(`[SaveSchedule] Failed to save item "${item.idea}":`, error)
        errors.push({ idea: item.idea, error: error instanceof Error ? error.message : 'Unknown error' })
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
