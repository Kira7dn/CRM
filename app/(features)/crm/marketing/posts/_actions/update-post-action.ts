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

    try {
        // ---------- Auth ----------
        const cookieStore = await cookies()
        const userIdCookie = cookieStore.get("admin_user_id")
        if (!userIdCookie) {
            return {
                success: false,
                post: null,
                error: "Unauthorized: Please login to continue"
            }
        }

        // ---------- Validation ----------
        if (!postId || postId.trim() === "") {
            return {
                success: false,
                post: null,
                error: "Post ID is required"
            }
        }

        // ---------- Parse schedule ----------
        const scheduledAt = payload.scheduledAt
            ? new Date(payload.scheduledAt)
            : undefined

        // ---------- UseCase ----------
        const useCase = await updatePostUseCase()
        console.log("[updatePostAction] Input:", { postId, payload })
        console.log("[updatePostAction] Platforms detail:", payload.platforms)
        console.log("[updatePostAction] Platforms type:", typeof payload.platforms, Array.isArray(payload.platforms))

        const result = await useCase.execute(
            {
                id: postId,
                idea: payload.idea,
                title: payload.title,
                body: payload.body,
                contentType: payload.contentType,
                platforms: payload.platforms,
                media: payload.media,
                hashtags: payload.hashtags,
                scheduledAt,
            }
        )

        console.log("[updatePostAction] UseCase result:", result)

        // ---------- Cache ----------
        revalidatePath("/crm/posts")

        if (result.post) {
            console.log("[updatePostAction] Success:", result.post)
            return {
                success: true,
                post: result.post,
                error: result.error // Include platform update errors as warnings
            }
        } else {
            console.log("[updatePostAction] Failed - no post returned, error:", result.error)
            return {
                success: false,
                post: null,
                error: result.error || "Failed to update post: Unknown error"
            }
        }
    } catch (error) {
        console.error("[updatePostAction] Exception:", error)
        const errorMessage = error instanceof Error
            ? error.message
            : "An unexpected error occurred while updating the post"

        return {
            success: false,
            post: null,
            error: errorMessage
        }
    }
}