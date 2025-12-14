'use client'

import { useRef, useCallback } from 'react'
import PostForm from './PostForm'
import type { Post } from '@/core/domain/marketing/post'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@shared/ui/dialog'

interface PostFormModalProps {
  open: boolean
  onClose: () => void
  post?: Post
  initialScheduledAt?: Date
}

export default function PostFormModal({ open, onClose, post, initialScheduledAt }: PostFormModalProps) {
  const handleCloseRef = useRef<(() => Promise<void>) | null>(null)

  const handleDialogOpenChange = useCallback(async (openState: boolean) => {
    // When dialog tries to close (openState = false), call PostForm's handleClose
    if (!openState && handleCloseRef.current) {
      await handleCloseRef.current()
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">
          {post ? `Edit Post ${post.id}` : 'Create New Post'}
        </DialogTitle>
        <PostForm
          post={post}
          onClose={onClose}
          initialScheduledAt={initialScheduledAt}
          registerHandleClose={(handler) => {
            handleCloseRef.current = handler
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
