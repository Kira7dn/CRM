'use client'

import type { Post, Platform } from '@/core/domain/marketing/post'
import { Button } from '@shared/ui/button'
import { X, ExternalLink, TrendingUp, Eye, Heart, MessageCircle, Share2, Calendar, Tag } from 'lucide-react'

interface PostDetailModalProps {
  post: Post
  onClose: () => void
}

const PLATFORM_COLORS: Record<Platform, string> = {
  facebook: 'bg-blue-600',
  tiktok: 'bg-black',
  zalo: 'bg-blue-500',
  youtube: 'bg-red-600',
  website: 'bg-gray-600',
  telegram: 'bg-blue-400',
  wordpress: 'bg-[#21759B]',
  instagram: 'bg-pink-600',
}

const PLATFORM_NAMES: Record<Platform, string> = {
  facebook: 'Facebook',
  tiktok: 'TikTok',
  zalo: 'Zalo',
  youtube: 'YouTube',
  website: 'Website',
  telegram: 'Telegram',
  wordpress: 'WordPress',
  instagram: 'Instagram',
}

export default function PostDetailModal({ post, onClose }: PostDetailModalProps) {
  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-500',
      scheduled: 'bg-blue-500',
      published: 'bg-green-500',
      failed: 'bg-red-500',
      archived: 'bg-gray-400',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b p-4 flex items-center justify-between">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 rounded">
                {post.contentType}
              </span>
              <span className="text-sm text-gray-500">
                Created: {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Body */}
          {post.body && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</h3>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{post.body}</p>
            </div>
          )}

          {/* Media */}
          {post.media && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Media
              </h3>
              <div className="border rounded-lg overflow-hidden">
                {post.media.type === 'video' ? (
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <video src={post.media.url} controls className="w-full h-full" />
                  </div>
                ) : (
                  <img
                    src={post.media.url}
                    alt="Media"
                    className="w-full aspect-video object-cover"
                  />
                )}
              </div>
            </div>
          )}

          {/* Platforms */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Publishing Platforms
            </h3>
            <div className="space-y-3">
              {post.platforms.map((pm, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-4 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 text-sm font-medium text-white rounded ${PLATFORM_COLORS[pm.platform]}`}>
                        {PLATFORM_NAMES[pm.platform]}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium text-white rounded ${getStatusBadge(pm.status)}`}>
                        {pm.status}
                      </span>
                    </div>
                    {pm.publishedAt && (
                      <p className="text-xs text-gray-500 mb-1">
                        Published: {new Date(pm.publishedAt).toLocaleString()}
                      </p>
                    )}
                    {pm.permalink && (
                      <a
                        href={pm.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        View on {PLATFORM_NAMES[pm.platform]}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {pm.error && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Error: {pm.error}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hashtags */}
          {post.hashtags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Hashtags ({post.hashtags.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mentions */}
          {post.mentions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mentions ({post.mentions.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.mentions.map((mention, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded"
                  >
                    @{mention}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Scheduled Date */}
          {post.scheduledAt && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Scheduled Date
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date(post.scheduledAt).toLocaleString()}
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t p-4 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}
