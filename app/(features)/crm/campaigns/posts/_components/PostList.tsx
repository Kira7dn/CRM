'use client'

import { useEffect, useState, useTransition } from 'react'
import type { Post, Platform } from '@/core/domain/marketing/post'
import { usePostStore } from '../_store/usePostStore'
import { deletePostAction } from '../actions'
import { Button } from '@shared/ui/button'
import { Trash2, Edit, Eye, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import PostDetailModal from './PostDetailModal'
import PostForm from './PostForm'

const PLATFORM_COLORS: Record<Platform, string> = {
  facebook: 'bg-blue-600 text-white',
  tiktok: 'bg-black text-white',
  zalo: 'bg-blue-500 text-white',
  youtube: 'bg-red-600 text-white',
  website: 'bg-gray-600 text-white',
  telegram: 'bg-blue-400 text-white',
  wordpress: 'bg-[#21759B] text-white',
  instagram: 'bg-pink-600 text-white',
}

const PLATFORM_LABELS: Record<Platform, string> = {
  facebook: 'FB',
  tiktok: 'TT',
  zalo: 'ZL',
  youtube: 'YT',
  website: 'WS',
  telegram: 'TG',
  wordpress: 'WP',
  instagram: 'IG',
}

export default function PostList({ initialPosts }: { initialPosts: Post[] }) {
  const { posts, setPosts, filter } = usePostStore()
  const [pending, startTransition] = useTransition()
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts, setPosts])

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(filter.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      startTransition(async () => {
        try {
          const result = await deletePostAction(id)

          if (result.success) {
            // Remove from local state
            setPosts(posts.filter(p => p.id !== id))

            // Check if any platforms were successfully deleted
            const deletedPlatforms = Object.keys(result.deletedOnPlatforms || {}).filter(
              platform => result.deletedOnPlatforms![platform]
            )

            if (deletedPlatforms.length > 0) {
              toast.success(`Post deleted successfully from CRM and ${deletedPlatforms.join(', ')} platforms`)
            } else {
              toast.success("Post deleted from CRM", {
                description: "Post was removed from database but not from external platforms"
              })
            }
          } else {
            toast.error("Delete failed", {
              description: result.error || "Failed to delete post"
            })
          }
        } catch (error) {
          toast.error("Delete failed", {
            description: error instanceof Error ? error.message : "An unexpected error occurred"
          })
        }
      })
    }
  }

  const handleViewDetail = (post: Post) => {
    setSelectedPost(post)
    setShowDetail(true)
  }

  const handleEdit = (post: Post) => {
    setEditingPost(post)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  if (editingPost) {
    return (
      <div className="mt-4">
        <PostForm post={editingPost} onClose={() => setEditingPost(null)} />
      </div>
    )
  }

  return (
    <>
      <div className="mt-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No posts found. Create your first post!
          </div>
        ) : (
          filtered.map((post) => (
            <div
              key={post.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Title and Content Type */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg truncate">{post.title}</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 rounded">
                      {post.contentType}
                    </span>
                  </div>

                  {/* Body Preview */}
                  {post.body && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {post.body}
                    </p>
                  )}

                  {/* Platforms */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500">Platforms:</span>
                    <div className="flex gap-1">
                      {post.platforms.map((pm, idx) => (
                        <div key={idx} className="relative group">
                          <span
                            className={`px-2 py-1 text-xs font-bold rounded ${PLATFORM_COLORS[pm.platform]}`}
                          >
                            {PLATFORM_LABELS[pm.platform]}
                          </span>
                          {getStatusIcon(pm.status)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hashtags */}
                  {post.hashtags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap mb-2">
                      {post.hashtags.slice(0, 5).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs text-blue-600 dark:text-blue-400"
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.hashtags.length > 5 && (
                        <span className="text-xs text-gray-500">
                          +{post.hashtags.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Scheduled/Created Date */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {post.scheduledAt && new Date(post.scheduledAt) > new Date() ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Scheduled: {new Date(post.scheduledAt).toLocaleString()}</span>
                      </div>
                    ) : (
                      <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                    )}
                    {post.media.length > 0 && (
                      <span>{post.media.length} media file{post.media.length > 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetail(post)}
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(post)}
                    title="Edit post"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                    disabled={pending}
                    title="Delete post"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => {
            setShowDetail(false)
            setSelectedPost(null)
          }}
        />
      )}
    </>
  )
}
