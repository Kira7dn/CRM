import { ContentType, Platform, Post, PostMedia } from "@/core/domain/marketing/post"
import { useRef, useState } from "react"

export interface PostFormState {
    title: string
    body: string
    media: PostMedia | null
    hashtags: string

    platforms: Platform[]
    contentType: ContentType
    scheduledAt?: string

    idea: string
    product?: ProductRef | null
    contentInstruction: string
}

export function usePostFormState({
    post,
    initialIdea,
    initialScheduledAt
}: {
    post?: Post
    initialIdea?: string
    initialScheduledAt?: Date
}) {
    const initialState = useRef<PostFormState>(
        post
            ? mapPostToFormState(post)
            : createEmptyState(initialIdea, initialScheduledAt)
    )

    const [state, setState] = useState<PostFormState>(
        initialState.current
    )

    // ---------- setters ----------
    const setField = <K extends keyof PostFormState>(
        key: K,
        value: PostFormState[K]
    ) => {
        setState(prev => ({ ...prev, [key]: value }))
    }

    // ---------- derived ----------
    const primaryPlatform = state.platforms.at(0)
    const hasTextContent = Boolean(
        state.title.trim() || state.body.trim()
    )

    const isDirty = !deepEqual(state, initialState.current)

    return {
        state,
        setField,

        // derived
        primaryPlatform,
        hasTextContent,
        isDirty
    }
}
