'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { Post } from '@/core/domain/marketing/post'
import { PostFormProvider } from './PostFormContext'
import PostFormView from './views'
import { usePostFormState } from './state/usePostFormState'
import { PostFormActions } from './actions/post-form-actions'
import { Product, ProductPlain } from '@/core/domain/catalog/product'

interface PostFormProps {
  post?: Post
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
  post,
  products,
  initialScheduledAt,
  initialIdea,
}: PostFormProps) {

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
