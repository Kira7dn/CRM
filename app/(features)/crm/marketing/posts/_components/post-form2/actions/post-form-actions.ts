import { Post } from '@/core/domain/marketing/post'
import { PostFormState } from '../state/usePostFormState'
import { updatePostAction } from '../../../_actions/update-post-action'
import { createPostAction } from '../../../_actions/create-post-action'
import { deletePostAction } from '../../../_actions/delete-post-action'

// ---------- helpers ----------

const parseHashtags = (value: string): string[] =>
  value
    .split(/\s+/)
    .filter(tag => tag.startsWith('#'))
    .map(tag => tag.slice(1))

// ---------- types ----------
// PostFormActions.ts
export interface PostFormActions {
  submit: () => Promise<void>
  saveDraft: () => Promise<void>
  delete: () => Promise<void>
  close: () => void
}

export type SubmitMode = 'draft' | 'schedule' | 'publish'

export interface PostFormActionsDeps {
  getState: () => PostFormState
  post?: Post
  onClose?: () => void
}

// ---------- factory ----------

/**
 * createPostFormActions
 *
 * Plain action factory (NO React, NO hook)
 */
export function createPostFormActions({
  getState,
  post,
  onClose,
}: PostFormActionsDeps): PostFormActions {

  // ===== submit (publish / schedule) =====

  const submit = async (): Promise<void> => {
    const state = getState()

    if (state.platforms.length === 0) {
      throw new Error('Please select at least one platform')
    }

    const payload = {
      title: state.title,
      body: state.body,
      contentType: state.contentType,
      platforms: state.platforms,
      media: state.media || undefined,
      hashtags: parseHashtags(state.hashtags),
      scheduledAt: state.scheduledAt?.toISOString(),
    }

    // update
    if (post?.id) {
      await updatePostAction({
        postId: post.id,
        payload,
      })
      return
    }

    // create
    await createPostAction({
      mode: state.scheduledAt ? 'schedule' : 'publish',
      payload,
    })
  }

  // ===== save draft =====

  const saveDraft = async (): Promise<void> => {
    const state = getState()

    const payload = {
      title: state.title,
      body: state.body,
      contentType: state.contentType,
      platforms: [], // draft không cần platform
      media: state.media || undefined,
      hashtags: parseHashtags(state.hashtags),
      scheduledAt: undefined,
    }

    if (post?.id) {
      await updatePostAction({
        postId: post.id,
        payload,
      })
      return
    }

    await createPostAction({
      mode: 'draft',
      payload,
    })
  }

  // ===== delete =====

  const deletePost = async (): Promise<void> => {
    if (!post?.id) {
      throw new Error('No post to delete')
    }

    await deletePostAction(post.id)
  }

  // ===== close =====

  const close = (): void => {
    onClose?.()
  }

  return {
    submit,
    saveDraft,
    delete: deletePost,
    close,
  }
}
