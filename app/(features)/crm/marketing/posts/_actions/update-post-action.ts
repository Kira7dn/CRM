"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { updatePostUseCase } from "@/app/api/posts/depends"
import { PostPayload } from "@/core/application/interfaces/marketing/post-repo"
import { PostStatus } from "@/core/domain/marketing/post"

export interface UpdatePostInput {
    postId: string
    payload: PostPayload
}


export async function updatePostAction(input: UpdatePostInput) {
    const { postId, payload } = input

    // ---------- Auth ----------
    const cookieStore = await cookies()
    const userIdCookie = cookieStore.get("admin_user_id")
    if (!userIdCookie) {
        throw new Error("Unauthorized")
    }

    // ---------- Parse schedule ----------
    const scheduledAt = payload.scheduledAt
        ? new Date(payload.scheduledAt)
        : undefined

    // ---------- UseCase ----------
    const useCase = await updatePostUseCase()
    const result = await useCase.execute(
        {
            id: postId,
            title: payload.title,
            body: payload.body,
            contentType: payload.contentType,
            platforms: payload.platforms?.map(platform => ({
                platform: platform.platform,
                status: (scheduledAt ? "scheduled" : "draft") as PostStatus
            })),
            media: payload.media,
            hashtags: payload.hashtags,
            scheduledAt,
        }
    )

    // ---------- Cache ----------
    revalidatePath("/crm/posts")

    return { success: true, post: result.post }
}