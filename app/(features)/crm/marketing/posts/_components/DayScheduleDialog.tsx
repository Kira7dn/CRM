'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Plus, Edit, Trash2, Calendar, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { Card } from '@shared/ui/card'
import { Post } from '@/core/domain/marketing/post'
import type { Platform, PostStatus } from '@/core/domain/marketing/post'
import { deletePostAction } from '../_actions/delete-post-action'

interface DayScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date
  posts: Post[]
}

const PLATFORM_COLORS: Record<Platform, { bg: string; text: string }> = {
  facebook: { bg: 'bg-[#1877F2]/10', text: 'text-[#1877F2]' },
  tiktok: { bg: 'bg-black/10', text: 'text-black' },
  zalo: { bg: 'bg-[#0068FF]/10', text: 'text-[#0068FF]' },
  youtube: { bg: 'bg-[#FF0000]/10', text: 'text-[#FF0000]' },
  website: { bg: 'bg-gray-500/10', text: 'text-gray-500' },
  telegram: { bg: 'bg-[#26A5E4]/10', text: 'text-[#26A5E4]' },
  wordpress: { bg: 'bg-[#21759B]/10', text: 'text-[#21759B]' },
  instagram: { bg: 'bg-[#E4405F]/10', text: 'text-[#E4405F]' },
}

const STATUS_COLORS: Record<PostStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
  scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled' },
  published: { bg: 'bg-green-100', text: 'text-green-700', label: 'Published' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' },
  archived: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Archived' },
}

export default function DayScheduleDialog({
  open,
  onOpenChange,
  selectedDate,
  posts,
}: DayScheduleDialogProps) {

  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleNewPost = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    router.push(`/crm/marketing/posts/new?scheduledAt=${dateStr}`)
    onOpenChange(false)
  }

  const handleEdit = (postId: string) => {
    router.push(`/crm/marketing/posts/edit?id=${postId}`)
    onOpenChange(false)
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    setDeletingId(postId)
    try {
      await deletePostAction(postId)
      // The store will be updated via revalidation
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('Failed to delete post. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const getPostStatus = (post: Post): PostStatus => {
    // Check platform statuses to determine overall status
    if (post.platforms.some((p) => p.status === 'published')) return 'published'
    if (post.platforms.some((p) => p.status === 'failed')) return 'failed'
    if (post.platforms.some((p) => p.status === 'scheduled')) return 'scheduled'
    return 'draft'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5" />
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </DialogTitle>
          <DialogDescription>
            {posts.length === 0
              ? 'No posts scheduled for this day'
              : `${posts.length} post${posts.length > 1 ? 's' : ''} on this day`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* New Post Button */}
            <Button
              onClick={handleNewPost}
              className="w-full h-auto py-4 flex items-center justify-center gap-2 border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary"
              variant="outline"
            >
              <Plus className="h-5 w-5" />
              <span className="font-semibold">Create New Post</span>
            </Button>

            {/* Posts List */}
            {posts.length > 0 && (
              <div className="space-y-3">
                {posts.map((post) => {
                  const status = getPostStatus(post)
                  const statusConfig = STATUS_COLORS[status]

                  return (
                    <Card
                      key={post.id}
                      className="p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-3">
                        {/* Header: Title & Status */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-base line-clamp-2 flex-1">
                            {post.title}
                          </h3>
                          <Badge
                            className={`${statusConfig.bg} ${statusConfig.text} shrink-0`}
                          >
                            {statusConfig.label}
                          </Badge>
                        </div>

                        {/* Body Preview */}
                        {post.body && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {post.body}
                          </p>
                        )}

                        {/* Platforms & Time */}
                        <div className="flex flex-wrap items-center gap-2">
                          {post.platforms.map((platform, idx) => {
                            const platformConfig = PLATFORM_COLORS[platform.platform]
                            return (
                              <Badge
                                key={idx}
                                variant="outline"
                                className={`${platformConfig?.bg || "bg-gray-100"} ${platformConfig?.text} border-0 text-xs`}
                              >
                                {platform.platform}
                              </Badge>
                            )
                          })}

                          {post.scheduledAt && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                              <Clock className="h-3 w-3" />
                              <span>{format(new Date(post.scheduledAt), 'HH:mm')}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Button
                            onClick={() => handleEdit(post.id)}
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(post.id)}
                            variant="outline"
                            size="sm"
                            disabled={deletingId === post.id}
                            className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deletingId === post.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
