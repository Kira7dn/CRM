import { Product } from '@/core/domain/catalog/product'
import { ContentType, PlatformMetadata, Post, PostMedia } from '@/core/domain/marketing/post'
import { useRef, useState, useCallback, useEffect } from 'react'


// ---------- types ----------
export interface PostFormState {
    // ===== form fields =====
    title: string
    body: string
    media: PostMedia | undefined
    hashtags: string
    platforms: PlatformMetadata[]
    contentType: ContentType
    scheduledAt?: Date

    // ===== AI / helper =====
    idea: string
    product: Product | undefined
    contentInstruction: string
    // Generation state
    variations: Array<{ title: string; content: string; style: string }>
}

function mapPostToFormState(
    post: Post,
    initialScheduledAt?: Date
): PostFormState {
    return {
        title: post.title ?? '',
        body: post.body ?? '',
        media: post.media ?? undefined,
        hashtags: post.hashtags?.join(' ') ?? '',
        platforms: post.platforms,
        contentType: post.contentType ?? 'post',
        scheduledAt: post.scheduledAt
            ? new Date(post.scheduledAt)
            : initialScheduledAt,

        idea: post.idea ?? '',
        product: undefined,
        contentInstruction: '',
        variations: [],
    }
}

function createEmptyState(
    initialScheduledAt?: Date
): PostFormState {
    return {
        title: '',
        body: '',
        media: undefined,
        hashtags: '',
        platforms: [],
        contentType: 'post',
        scheduledAt: initialScheduledAt,
        idea: '',
        product: undefined,
        contentInstruction: '',
        variations: [],
    }
}

// ---------- hook (React adapter) ----------

export function usePostFormState({
    post,
    initialScheduledAt,
}: {
    post?: Post
    initialScheduledAt?: Date
}) {
    // snapshot ban đầu
    const initialStateRef = useRef<PostFormState>(
        post
            ? mapPostToFormState(post, initialScheduledAt)
            : createEmptyState(initialScheduledAt)
    )
    const isDirtyRef = useRef(false)

    const [state, setState] = useState<PostFormState>(
        initialStateRef.current
    )
    console.log(state);


    // reset khi đổi post (edit post khác / click calendar)
    useEffect(() => {
        initialStateRef.current = post
            ? mapPostToFormState(post, initialScheduledAt)
            : createEmptyState(initialScheduledAt)

        isDirtyRef.current = false
        setState(initialStateRef.current)
    }, [post?.id, initialScheduledAt])

    // ---------- setters ----------

    const setField = useCallback(
        <K extends keyof PostFormState>(key: K, value: PostFormState[K]) => {
            isDirtyRef.current = true
            setState(prev => ({ ...prev, [key]: value }))
        },
        []
    )

    const updateMultipleFields = useCallback(
        (updates: Partial<PostFormState>) => {
            isDirtyRef.current = true
            setState(prev => ({ ...prev, ...updates }))
        },
        []
    )


    return {
        state,
        setField,
        updateMultipleFields,
        isDirty: isDirtyRef.current,
    }
}
