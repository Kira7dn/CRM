"use server"

import { revalidatePath } from "next/cache"
import { getPostsUseCase, createPostUseCase, updatePostUseCase, deletePostUseCase } from "@/app/api/posts/depends"
import type { Platform, ContentType, PostMedia, PlatformMetadata } from "@/core/domain/managements/post"

export async function createPostAction(formData: FormData) {
  const useCase = await createPostUseCase()

  const title = formData.get("title")?.toString() || ""
  const body = formData.get("body")?.toString()
  const contentType = formData.get("contentType")?.toString() as ContentType || "post"
  const platformsJson = formData.get("platforms")?.toString() || "[]"
  const mediaJson = formData.get("media")?.toString() || "[]"
  const hashtagsStr = formData.get("hashtags")?.toString() || ""
  const scheduledAtStr = formData.get("scheduledAt")?.toString()

  // Parse platforms from JSON
  const selectedPlatforms: Platform[] = JSON.parse(platformsJson)
  const platforms: PlatformMetadata[] = selectedPlatforms.map(platform => ({
    platform,
    status: "draft" as const,
  }))

  // Parse media from JSON
  const media: PostMedia[] = JSON.parse(mediaJson)

  // Parse hashtags
  const hashtags = hashtagsStr
    .split(/\s+/)
    .filter(tag => tag.startsWith('#'))
    .map(tag => tag.slice(1))
    .filter(tag => tag.length > 0)

  // Parse scheduled date
  const scheduledAt = scheduledAtStr ? new Date(scheduledAtStr) : undefined

  const now = new Date()

  await useCase.execute({
    title,
    body,
    contentType,
    platforms,
    media,
    hashtags,
    scheduledAt,
    createdAt: now,
    updatedAt: now,
  })

  revalidatePath("/crm/posts")
}

export async function getPostsAction() {
  const useCase = await getPostsUseCase()
  const result = await useCase.execute()
  return result.posts
}

export async function deletePostAction(id: string) {
  const useCase = await deletePostUseCase()
  await useCase.execute({ id })
  revalidatePath("/crm/posts")
}

export async function updatePostAction(id: string, formData: FormData) {
  const useCase = await updatePostUseCase()

  const title = formData.get("title")?.toString()
  const body = formData.get("body")?.toString()
  const contentType = formData.get("contentType")?.toString() as ContentType
  const platformsJson = formData.get("platforms")?.toString()
  const mediaJson = formData.get("media")?.toString()
  const hashtagsStr = formData.get("hashtags")?.toString()
  const scheduledAtStr = formData.get("scheduledAt")?.toString()

  const updateData: any = {
    id,
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
    updateData.scheduledAt = new Date(scheduledAtStr)
  }

  await useCase.execute(updateData)
  revalidatePath("/crm/posts")
}
