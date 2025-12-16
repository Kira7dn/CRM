'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { Post } from '@/core/domain/marketing/post'
import { PostFormProvider } from './PostFormContext'
import PostFormView from './views/PostFormView'
import { usePostFormState } from './state/usePostFormState'
import { createPostFormActions } from './actions/post-form-actions'
import { Product, ProductPlain } from '@/core/domain/catalog/product'

interface PostFormProps {
  post?: Post
  products: ProductPlain[]
  hasBrandMemory: boolean
  onClose?: () => void
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
  hasBrandMemory,
  onClose,
  initialScheduledAt,
  initialIdea,
}: PostFormProps) {

  // ========== Form State ==========
  const {
    state,
    setField,
    updateMultipleFields,
    primaryPlatform,
    hasTextContent,
    isVideoContent,
    isDirty,
  } = usePostFormState({
    post,
    initialIdea,
    initialScheduledAt,
  })

  // Sync products data into state when loaded
  useEffect(() => {
    if (products.length > 0) {
      const productInstances = products.map(product =>
        Product.fromPlain(product)
      )
      updateMultipleFields({
        products: productInstances,
        hasBrandMemory,
      })
    }
  }, [products, hasBrandMemory, updateMultipleFields])


  // ========== Form Actions ==========
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  const actions = useMemo(
    () =>
      createPostFormActions({
        getState: () => stateRef.current,
        post,
        onClose,
      }),
    [post, onClose]
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
  console.log("state:", state);

  return (
    <PostFormProvider value={contextValue}>
      <PostFormView />
    </PostFormProvider>
  )
}
