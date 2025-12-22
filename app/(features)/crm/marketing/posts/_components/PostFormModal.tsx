'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@shared/ui/dialog'
import { Badge } from '@shared/ui/badge'
import PostForm from './post-form/PostForm'
import { usePostStore } from '../_store/usePostStore'

/**
 * Unified Post Form Modal
 * Handles both preview posts (with tempId) and real posts (with id)
 * Uses Zustand store for state management - no props drilling
 */
export default function PostFormModal() {
  const {
    isPostFormModalOpen,
    closePostFormModal,
    selectedPost,
    selectedDate,
  } = usePostStore()

  const isPreview = selectedPost?.id?.startsWith('temp')

  return (
    <Dialog open={isPostFormModalOpen} onOpenChange={closePostFormModal}>
      <DialogContent className="w-[95vw] sm:w-[90vw] lg:max-w-6xl h-[95vh] sm:h-[90vh] max-h-[900px] flex flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            {isPreview ? '📝 Preview Post' : selectedPost ? '✏️ Edit Post' : '➕ New Post'}
            {isPreview && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                Not Saved
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="mt-1">
            {isPreview
              ? 'Review and edit this post before saving to database.'
              : selectedPost
                ? 'Edit post details and schedule.'
                : 'Create a new post and schedule it.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-6 pb-6">
          {/* Use PostForm for both preview and real posts */}
          <PostForm
            post={selectedPost || undefined}
            initialScheduledAt={selectedDate || undefined}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
