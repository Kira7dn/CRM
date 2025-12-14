import { Platform } from "@/core/domain/marketing/post"
import { PostFormState } from "./usePostFormState"
import { toast } from "sonner"
import { generatePostMultiPassAction } from "../actions"

interface UsePostFormActionsDeps {
    state: PostFormState
    primaryPlatform?: Platform
    onClose?: () => void
}

export function usePostFormActions({
    state,
    primaryPlatform,
    onClose
}: UsePostFormActionsDeps) {

    const generateAI = async () => {
        if (!primaryPlatform) {
            toast.error('Please select a platform first')
            return
        }

        const result = await generatePostMultiPassAction({
            topic: state.title || state.idea,
            platform: primaryPlatform,
            idea: state.idea || undefined,
            productUrl: state.product?.url,
            detailInstruction: state.contentInstruction
        })

        if (!result.success) {
            toast.error(result.error)
            return
        }

        return {
            title: result.title,
            body: result.content,
            score: result.metadata?.score,
            warnings: result.warnings
        }
    }

    const submitPost = async (mode: 'draft' | 'schedule' | 'publish') => {
        if (!primaryPlatform && mode !== 'draft') {
            toast.error('Please select at least one platform')
            return
        }

        await submitPostAction({
            mode,
            payload: state
        })

        toast.success(
            mode === 'draft'
                ? 'Draft saved'
                : mode === 'schedule'
                    ? 'Post scheduled'
                    : 'Post published'
        )

        onClose?.()
    }

    const deletePost = async (postId: number) => {
        await deletePostAction(postId)
        toast.success('Post deleted')
        onClose?.()
    }

    return {
        generateAI,
        submitPost,
        deletePost
    }
}
