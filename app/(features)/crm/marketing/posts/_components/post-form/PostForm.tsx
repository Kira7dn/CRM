'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Post } from '@/core/domain/marketing/post'
import { PostFormProvider } from './PostFormContext'
import PostFormView from './views'
import { usePostFormState } from './state/usePostFormState'
import { PostFormActions } from './actions/post-form-actions'
import { Product, ProductPlain } from '@/core/domain/catalog/product'
import { usePostStore } from '../../_store/usePostStore'

interface PostFormProps {
  postId?: string
  products?: ProductPlain[]
  initialScheduledAt?: Date
  initialIdea?: string
}

/**
 * PostForm Controller
 *
 * Responsibilities:
 * - Own form state
 * - Wire form actions
 * - Provide context to view
 */
export default function PostForm({
  postId,
  products,
  initialScheduledAt,
  initialIdea,
}: PostFormProps) {
  const { findPostById } = usePostStore()
  const [post, setPost] = useState<Post | undefined>(undefined)

  // Load post if postId is provided
  useEffect(() => {
    if (postId) {
      findPostById(postId).then(setPost)
    }
  }, [postId, findPostById])


  // ========== Form State ==========
  const {
    state,
    setField,
    updateMultipleFields,
    isDirty,
  } = usePostFormState({
    post,
    initialIdea,
    initialScheduledAt,
  })

  // ========== Form Actions ==========
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  const actions = useMemo(
    () =>
      PostFormActions({
        getState: () => stateRef.current,
        post,
      }),
    [post]
  )

  // Convert ProductPlain[] to Product[] for context
  const convertedProducts = useMemo(() => {
    return products?.map(product => Product.fromPlain(product))
  }, [products])

  // ========== Context ==========
  const contextValue = useMemo(
    () => ({
      state,
      post,
      products: convertedProducts,
      actions,
      isSubmitting: false,
      isDirty,
      setField,
      updateMultipleFields,
    }),
    [state, post, products, actions, isDirty, setField, updateMultipleFields]
  )
  return (
    <PostFormProvider value={contextValue}>
      <PostFormView />
    </PostFormProvider>
  )
}
