import { Product } from '@/core/domain/catalog/product'
import { ContentType, Platform, Post, PostMedia } from '@/core/domain/marketing/post'
import { useRef, useState, useCallback, useEffect } from 'react'


// ---------- types ----------

export interface PostFormState {
    // ===== form fields =====
    title: string
    body: string
    media: PostMedia | null
    hashtags: string
    platforms: Platform[]
    contentType: ContentType
    scheduledAt?: Date

    // ===== AI / helper =====
    idea: string
    product: Product | null
    contentInstruction: string

    // ===== runtime / bootstrap =====
    products: Product[]
    variations: Array<{ title: string; content: string; style: string }>
    hasBrandMemory: boolean
}

// ---------- helpers ----------

function createBaseState(): Omit<
    PostFormState,
    | 'title'
    | 'body'
    | 'media'
    | 'hashtags'
    | 'platforms'
    | 'contentType'
    | 'scheduledAt'
> {
    return {
        idea: '',
        product: null,
        contentInstruction: '',
        products: [],
        variations: [],
        hasBrandMemory: false,
    }
}

function mapPostToFormState(
    post: Post,
    initialIdea?: string,
    initialScheduledAt?: Date
): PostFormState {
    return {
        title: post.title ?? '',
        body: post.body ?? '',
        media: post.media ?? null,
        hashtags: post.hashtags?.join(' ') ?? '',
        platforms: post.platforms.map(p => p.platform),
        contentType: post.contentType ?? 'post',
        scheduledAt: post.scheduledAt
            ? new Date(post.scheduledAt)
            : initialScheduledAt,

        ...createBaseState(),

        idea: initialIdea ?? '',
    }
}

function createEmptyState(
    initialIdea?: string,
    initialScheduledAt?: Date
): PostFormState {
    return {
        title: '',
        body: '',
        media: null,
        hashtags: '',
        platforms: [],
        contentType: 'post',
        scheduledAt: initialScheduledAt,

        ...createBaseState(),

        idea: initialIdea ?? '',
    }
}

// ---------- hook (React adapter) ----------

export function usePostFormState({
    post,
    initialIdea,
    initialScheduledAt,
}: {
    post?: Post
    initialIdea?: string
    initialScheduledAt?: Date
}) {
    // snapshot ban đầu
    const initialStateRef = useRef<PostFormState>(
        post
            ? mapPostToFormState(post, initialIdea, initialScheduledAt)
            : createEmptyState(initialIdea, initialScheduledAt)
    )

    const isDirtyRef = useRef(false)

    const [state, setState] = useState<PostFormState>(
        initialStateRef.current
    )

    // reset khi đổi post (edit post khác / click calendar)
    useEffect(() => {
        initialStateRef.current = post
            ? mapPostToFormState(post, initialIdea, initialScheduledAt)
            : createEmptyState(initialIdea, initialScheduledAt)

        isDirtyRef.current = false
        setState(initialStateRef.current)
    }, [post?.id, initialIdea, initialScheduledAt])

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

    // ---------- derived ----------

    const primaryPlatform = state.platforms[0] ?? null

    const hasTextContent =
        Boolean(state.title.trim() || state.body.trim())

    const isVideoContent =
        state.contentType === 'video' ||
        state.contentType === 'short'

    return {
        state,
        setField,
        updateMultipleFields,

        // derived
        primaryPlatform,
        hasTextContent,
        isVideoContent,
        isDirty: isDirtyRef.current,
    }
}
