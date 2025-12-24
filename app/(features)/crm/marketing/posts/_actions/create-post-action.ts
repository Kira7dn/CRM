"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { createPostUseCase } from "@/app/api/posts/depends"
import type { PostStatus } from "@/core/domain/marketing/post"
import { PostPayload } from "@/core/application/interfaces/marketing/post-repo"


export interface SubmitPostInput {
  payload: PostPayload
}

export async function createPostAction(input: SubmitPostInput) {
  const { payload } = input

  // ---------- Auth ----------
  const cookieStore = await cookies()
  const userIdCookie = cookieStore.get("admin_user_id")
  if (!userIdCookie) {
    throw new Error("Unauthorized")
  }

  const userId = userIdCookie.value

  // ---------- Validation ----------
  if (payload.platforms?.length === 0) {
    throw new Error("At least one platform is required")
  }

  if (!payload.title && !payload.body) {
    throw new Error("Post content is empty")
  }

  // ---------- Parse schedule ----------
  const scheduledAt = payload.scheduledAt
    ? new Date(payload.scheduledAt)
    : undefined

  // ---------- UseCase ----------
  const useCase = await createPostUseCase()

  const post = await useCase.execute({
    userId,
    title: payload.title,
    body: payload.body,
    contentType: payload.contentType,
    platforms: payload.platforms?.map(platform => ({
      platform: platform.platform,
      status: platform.status,
    })),
    media: payload.media,
    hashtags: payload.hashtags,
    scheduledAt,
  })

  revalidatePath("/crm/posts")

  return {
    success: true,
    post,
  }
}
