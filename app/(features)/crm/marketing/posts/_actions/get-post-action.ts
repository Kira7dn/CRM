"use server"
import { getPostsUseCase } from "@/app/api/posts/depends"


export async function getPostsAction() {
    const serverStartTime = performance.now()
    console.log('[getPostsAction] Server processing started at:', serverStartTime)

    const useCase = await getPostsUseCase()
    const result = await useCase.execute()

    const serverEndTime = performance.now()
    const serverProcessTime = serverEndTime - serverStartTime
    console.log(`[getPostsAction] Server processing completed in ${serverProcessTime.toFixed(2)}ms`)

    return {
        posts: result.posts,
        serverProcessTime: serverProcessTime
    }
}