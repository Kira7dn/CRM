"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { parseDateTimeLocal } from "@/lib/date-utils"
import { getPostsUseCase, createPostUseCase, updatePostUseCase, deletePostUseCase } from "@/app/api/posts/depends"
import { createGeneratePostContentUseCase, createGeneratePostMultiPassUseCase } from "@/app/api/content-generation/depends"
import { createGetBrandMemoryUseCase, createSaveBrandMemoryUseCase } from "@/app/api/brand-memory/depends"
import { createCheckContentSimilarityUseCase, createStoreContentEmbeddingUseCase } from "@/app/api/content-memory/depends"
import type { Platform, ContentType, PostMedia, PlatformMetadata } from "@/core/domain/marketing/post"
import type { BrandMemoryPayload } from "@/core/application/interfaces/brand-memory-service"

export async function createPostAction(formData: FormData) {
  const useCase = await createPostUseCase()

  // Get current user ID from cookies
  const cookieStore = await cookies()
  const userIdCookie = cookieStore.get("admin_user_id")
  if (!userIdCookie) {
    throw new Error("Unauthorized - Please login first")
  }

  const title = formData.get("title")?.toString() || ""
  const body = formData.get("body")?.toString() || ""
  const contentType = formData.get("contentType")?.toString() as ContentType || "post"
  const platformsJson = formData.get("platforms")?.toString() || "[]"
  const mediaJson = formData.get("media")?.toString() || "[]"
  const hashtagsStr = formData.get("hashtags")?.toString() || ""
  const scheduledAtStr = formData.get("scheduledAt")?.toString()
  const saveAsDraft = formData.get("saveAsDraft")?.toString() === "true"

  // Parse platforms from JSON
  const selectedPlatforms: Platform[] = JSON.parse(platformsJson)
  const platforms: PlatformMetadata[] = selectedPlatforms.map(platform => ({
    platform,
    status: "draft" as const, // Will be overridden by use case logic
  }))

  // Parse media from JSON
  const media: PostMedia[] = JSON.parse(mediaJson)

  // Parse hashtags
  const hashtags = hashtagsStr
    .split(/\s+/)
    .filter(tag => tag.startsWith('#'))
    .map(tag => tag.slice(1))
    .filter(tag => tag.length > 0)

  // Parse scheduled date (handle timezone properly)
  const scheduledAt = scheduledAtStr ? parseDateTimeLocal(scheduledAtStr) : undefined

  const now = new Date()

  const result = await useCase.execute({
    userId: userIdCookie.value,
    title,
    body,
    contentType,
    platforms,
    media,
    hashtags,
    scheduledAt,
    saveAsDraft,
    createdAt: now,
    updatedAt: now,
  })

  revalidatePath("/crm/posts")

  // Return platform results for client-side toast notifications
  return {
    success: true,
    platformResults: result.platformResults,
    postId: result.post.id
  }
}

export async function getPostsAction() {
  const useCase = await getPostsUseCase()
  const result = await useCase.execute()
  return result.posts
}

export async function deletePostAction(id: string) {
  const useCase = await deletePostUseCase()

  // Get current user ID from cookies
  const cookieStore = await cookies()
  const userIdCookie = cookieStore.get("admin_user_id")
  if (!userIdCookie) {
    throw new Error("Unauthorized - Please login first")
  }

  await useCase.execute({
    id,
    userId: userIdCookie.value
  })
  revalidatePath("/crm/posts")
}

export async function updatePostAction(id: string, formData: FormData) {
  const useCase = await updatePostUseCase()

  // Get current user ID from cookies
  const cookieStore = await cookies()
  const userIdCookie = cookieStore.get("admin_user_id")
  if (!userIdCookie) {
    throw new Error("Unauthorized - Please login first")
  }

  const title = formData.get("title")?.toString() || ""
  const body = formData.get("body")?.toString()
  const contentType = (formData.get("contentType")?.toString() as ContentType) || "post"
  const platformsJson = formData.get("platforms")?.toString() || ""
  const mediaJson = formData.get("media")?.toString() || ""
  const hashtagsStr = formData.get("hashtags")?.toString() || ""
  const scheduledAtStr = formData.get("scheduledAt")?.toString() || ""

  const updateData: any = {
    id,
    userId: userIdCookie.value,
    updatedAt: new Date(),
  }

  if (title) updateData.title = title
  if (body !== undefined) updateData.body = body
  if (contentType) updateData.contentType = contentType

  if (platformsJson) {
    const selectedPlatforms: Platform[] = JSON.parse(platformsJson)
    updateData.platforms = selectedPlatforms.map(platform => ({
      platform,
      status: "draft" as const,
    }))
  }

  if (mediaJson) {
    updateData.media = JSON.parse(mediaJson)
  }

  if (hashtagsStr !== undefined) {
    updateData.hashtags = hashtagsStr
      .split(/\s+/)
      .filter(tag => tag.startsWith('#'))
      .map(tag => tag.slice(1))
      .filter(tag => tag.length > 0)
  }

  if (scheduledAtStr) {
    updateData.scheduledAt = parseDateTimeLocal(scheduledAtStr)
  }

  await useCase.execute(updateData)
  revalidatePath("/crm/posts")
}

export async function generatePostContentAction(params: {
  topic?: string
  platform?: string
  idea?: string // NEW
  productUrl?: string // NEW
  detailInstruction?: string // NEW
}) {
  try {
    const useCase = await createGeneratePostContentUseCase()
    const result = await useCase.execute(params)
    return { success: true, content: result }
  } catch (error) {
    console.error("Failed to generate content:", error)
    return { success: false, error: String(error) }
  }
}

/**
 * Get brand memory settings
 */
export async function getBrandMemoryAction() {
  try {
    const useCase = await createGetBrandMemoryUseCase()
    const result = await useCase.execute({})
    return { success: true, brandMemory: result.brandMemory }
  } catch (error) {
    console.error("Failed to get brand memory:", error)
    return { success: false, error: String(error) }
  }
}

/**
 * Save brand memory settings
 */
export async function saveBrandMemoryAction(payload: BrandMemoryPayload) {
  try {
    const useCase = await createSaveBrandMemoryUseCase()
    const result = await useCase.execute(payload)
    revalidatePath("/crm/campaigns/posts")
    return { success: true, brandMemory: result.brandMemory }
  } catch (error) {
    console.error("Failed to save brand memory:", error)
    return { success: false, error: String(error) }
  }
}

/**
 * Check content similarity before generation
 */
export async function checkContentSimilarityAction(params: {
  content: string
  title?: string
  platform?: string
  similarityThreshold?: number
}) {
  try {
    const useCase = await createCheckContentSimilarityUseCase()
    const result = await useCase.execute(params)
    return { success: true, ...result }
  } catch (error) {
    console.error("Failed to check content similarity:", error)
    // Return non-similar result on error to allow content creation
    return {
      success: false,
      isSimilar: false,
      maxSimilarity: 0,
      similarContent: [],
      error: String(error)
    }
  }
}

/**
 * Store content embedding after post creation
 */
export async function storeContentEmbeddingAction(params: {
  postId: string
  content: string
  title?: string
  platform?: string
  topic?: string
}) {
  try {
    const useCase = await createStoreContentEmbeddingUseCase()
    const result = await useCase.execute(params)
    return { success: true, embeddingId: result.embeddingId }
  } catch (error) {
    console.error("Failed to store content embedding:", error)
    // Don't fail the whole operation if embedding storage fails
    return { success: false, error: String(error) }
  }
}

/**
 * Generate post content with multi-pass approach
 * Uses episodic memory to store intermediate results
 */
export async function generatePostMultiPassAction(params: {
  topic?: string
  platform?: string
  sessionId?: string
  idea?: string // NEW
  productUrl?: string // NEW
  detailInstruction?: string // NEW
}) {
  try {
    // Get brand memory
    const brandMemoryResult = await getBrandMemoryAction()
    const brandMemory = brandMemoryResult.success ? brandMemoryResult.brandMemory : undefined

    // Execute multi-pass generation
    const useCase = await createGeneratePostMultiPassUseCase()
    const result = await useCase.execute({
      topic: params.topic,
      platform: params.platform,
      sessionId: params.sessionId,
      idea: params.idea, // NEW
      productUrl: params.productUrl, // NEW
      detailInstruction: params.detailInstruction, // NEW
      brandMemory: brandMemory ? {
        brandDescription: brandMemory.brandDescription, // FIXED: was productDescription
        contentStyle: brandMemory.contentStyle,
        language: brandMemory.language,
        brandVoice: brandMemory.brandVoice,
        keyPoints: brandMemory.keyPoints,
      } : undefined,
    })

    return {
      success: true,
      title: result.title,
      content: result.content,
      sessionId: result.sessionId,
      metadata: result.metadata,
    }
  } catch (error) {
    console.error("Failed to generate multi-pass content:", error)
    return { success: false, error: String(error) }
  }
}

/**
 * Save schedule items as draft posts
 */
export async function saveScheduleToPostsAction(scheduleItems: Array<{
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
          media: [],
          hashtags: [],
          scheduledAt,
          saveAsDraft: true, // Save as draft so user can edit before publishing
          createdAt: now,
          updatedAt: now,
        })

        results.push({ success: true, postId: result.post.id, title: item.title })
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
