import { Post, PostStatus } from '@/core/domain/marketing/post'
import { PostFormState } from '../state/usePostFormState'
import type { PostPayload } from '@/core/application/interfaces/marketing/post-repo'
import { parseHashtags } from '../views/utils'

// ---------- types ----------

export interface PostFormActions {
  submit: () => Promise<void>
  saveDraft: () => Promise<void>
  delete: () => Promise<void>
}

export type SubmitMode = 'draft' | 'schedule' | 'publish'

export interface PostFormActionsDeps {
  getState: () => PostFormState
  post?: Post
  updatePost: (postId: string, payload: PostPayload) => Promise<{ success: boolean; post: Post | null }>
  createPost: (payload: PostPayload) => Promise<{ success: boolean; post: Post }>
  deletePost: (postId: string) => Promise<void>
}

// ---------- factory ----------

/**
 * PostFormActions
 *
 * Plain action factory (NO React, NO hook)
 * Modal closing is handled automatically by usePostStore.createPost/updatePost
 */
export function PostFormActions({
  getState,
  post,
  updatePost,
  createPost,
  deletePost,
}: PostFormActionsDeps): PostFormActions {
  // ===== submit (publish / schedule) =====
  const submit = async (): Promise<void> => {
    const state = getState()

    if (state.platforms.length === 0) {
      throw new Error('Please select at least one platform')
    }

    const payload: PostPayload = {
      title: state.title,
      body: state.body,
      contentType: state.contentType,
      platforms: state.platforms.map((platform) => ({
        platform: platform.platform,
        status: 'scheduled' as PostStatus,
      })),
      media: state.media || undefined,
      hashtags: parseHashtags(state.hashtags),
      scheduledAt: state.scheduledAt ? state.scheduledAt : undefined,
    }

    // update
    if (post?.id) {
      await updatePost(post.id, payload)
      return
    }

    // create
    await createPost(payload)
  }

  // ===== save draft =====

  const saveDraft = async (): Promise<void> => {
    const state = getState()

    const payload: PostPayload = {
      title: state.title,
      body: state.body,
      contentType: state.contentType,
      platforms: state.platforms.map((platform) => ({
        platform: platform.platform,
        status: 'draft' as PostStatus,
      })),
      media: state.media || undefined,
      hashtags: parseHashtags(state.hashtags),
      scheduledAt: state.scheduledAt ? state.scheduledAt : undefined,
    }

    if (post?.id) {
      await updatePost(post.id, payload)
      return
    }

    await createPost(payload)
  }

  // ===== delete =====

  const deletePostAction = async (): Promise<void> => {
    if (!post?.id) {
      throw new Error('No post to delete')
    }

    await deletePost(post.id)
  }

  return {
    submit,
    saveDraft,
    delete: deletePostAction,
  }
}
