'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Post, ContentType } from '@/core/domain/marketing/post'
import { PostFormProvider } from './PostFormContext'
import PostFormView from './views'
import { usePostFormState } from './state/usePostFormState'
import { PostFormActions } from './actions/post-form-actions'
import { usePostStore } from '../../_store/usePostStore'

interface PostFormProps {
  post?: Post
  initialScheduledAt?: Date
}

/**
 * PostForm Controller
 *
 * Responsibilities:
 * - Own form state
 * - Wire form actions
 * - Provide context to view
 * - Modal closing is handled by usePostStore automatically
 */
export default function PostForm({
  post,
  initialScheduledAt,
}: PostFormProps) {

  // ========== Form State ==========
  const { state, setField, updateMultipleFields, isDirty } = usePostFormState({
    post,
    initialScheduledAt,
  })

  // ========== Store Methods ==========
  const { updatePost, createPost, deletePost, setPostFormDirty } = usePostStore()

  // ========== Sync isDirty to Store ==========
  useEffect(() => {
    setPostFormDirty(isDirty)
  }, [isDirty, setPostFormDirty])

  // ========== Form Actions ==========
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  const getState = () => stateRef.current

  const actions = useMemo(
    () =>
      PostFormActions({
        getState,
        post,
        updatePost,
        createPost,
        deletePost,
      }),
    [post, updatePost, createPost, deletePost]
  )

  // ========== Context ==========
  const contextValue = useMemo(
    () => ({
      state,
      post,
      actions,
      isSubmitting: false,
      isDirty,
      setField,
      updateMultipleFields,
    }),
    [state, post, actions, isDirty, setField, updateMultipleFields]
  )
  return (
    <PostFormProvider value={contextValue}>
      <div className="w-full h-full overflow-hidden">
        <PostFormView />
      </div>
    </PostFormProvider>
  )
}
