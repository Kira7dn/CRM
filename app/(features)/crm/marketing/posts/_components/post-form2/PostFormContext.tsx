'use client'

import { createContext, useContext, ReactNode } from 'react'
import type { Post } from '@/core/domain/marketing/post'
import type { PostFormState } from './state/usePostFormState'
import { PostFormActions } from './actions/post-form-actions'

// ---------- types ----------

interface PostFormContextValue {
  state: PostFormState
  setField: (key: keyof PostFormState, value: any) => void
  updateMultipleFields: (updates: Partial<PostFormState>) => void
  post?: Post
  actions: PostFormActions
  isSubmitting: boolean
  isDirty: boolean
}

// ---------- context ----------

const PostFormContext = createContext<PostFormContextValue | null>(null)

// ---------- provider ----------

interface PostFormProviderProps {
  children: ReactNode
  value: PostFormContextValue
}

export function PostFormProvider({ children, value }: PostFormProviderProps) {
  return (
    <PostFormContext.Provider value={value}>
      {children}
    </PostFormContext.Provider>
  )
}

// ---------- hooks ----------

export function usePostFormContext() {
  const context = useContext(PostFormContext)
  if (!context) {
    throw new Error('usePostFormContext must be used within PostFormProvider')
  }
  return context
}

export function usePostFormData() {
  const { state, post, actions, isSubmitting, isDirty, setField, updateMultipleFields } = usePostFormContext()
  return { state, post, actions, isSubmitting, isDirty, setField, updateMultipleFields }
}

export function usePostFormActions() {
  return usePostFormContext().actions
}