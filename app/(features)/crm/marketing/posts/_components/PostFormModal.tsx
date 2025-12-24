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
import { isPreviewPost, getPostStatus } from '../_lib/post-status'
import type { Post } from '@/core/domain/marketing/post'

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

  const isPreview = isPreviewPost(selectedPost || undefined)

  return (
    <Dialog open={isPostFormModalOpen} onOpenChange={closePostFormModal}>
      <DialogContent className="w-[95vw] sm:w-[90vw] lg:max-w-6xl h-[95vh] sm:h-[90vh] max-h-225 flex flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            {selectedPost ? 'Edit Post' : 'Create New Post'}

            {/* Form Mode Badge */}
            <FormModeBadge post={selectedPost} />
          </DialogTitle>

          <DialogDescription className="mt-1">
            {getDialogDescription(selectedPost)}
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

// Helper component for visual state badge
function FormModeBadge({ post }: { post: Post | null }) {
  if (!post) {
    return null // New post, no badge needed
  }

  const isPreview = isPreviewPost(post)

  if (isPreview) {
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-300">
        📝 Not Saved
      </Badge>
    )
  }

  const status = getPostStatus(post)

  const statusConfig = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: '💾 Draft', border: 'border-gray-300' },
    scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: '📅 Scheduled', border: 'border-blue-300' },
    published: { bg: 'bg-green-100', text: 'text-green-700', label: '✅ Published', border: 'border-green-300' },
    failed: { bg: 'bg-red-100', text: 'text-red-700', label: '❌ Failed', border: 'border-red-300' },
    archived: { bg: 'bg-amber-100', text: 'text-amber-700', label: '📦 Archived', border: 'border-amber-300' },
  }

  const config = statusConfig[status]

  return (
    <Badge className={`${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </Badge>
  )
}

// Helper for dynamic description text
function getDialogDescription(post: Post | null): string {
  if (!post) {
    return 'Create a new post and schedule it for your platforms.'
  }

  if (isPreviewPost(post)) {
    return 'Review and edit this AI-generated post before saving to database.'
  }

  const status = getPostStatus(post)
  const descriptions = {
    draft: 'Edit this draft and publish or schedule it.',
    scheduled: 'Edit scheduling details or publish this post now.',
    published: 'View and update this published post.',
    failed: 'Fix errors and retry publishing this post.',
    archived: 'This post has been archived.',
  }

  return descriptions[status]
}
