'use client'

import { useState } from 'react'
import { Plus, Settings } from 'lucide-react'
import { Button } from '@shared/ui/button'
import PostsView from './PostsView'
import PostFormModal from './PostFormModal'
import PostContentSettings from './PostContentSettings'
import type { Post } from '@/core/domain/marketing/post'
import { useScheduledPostUpdater } from '../_hooks/useScheduledPostUpdater'

interface PostsPageClientProps {
  initialPosts: Post[]
}

export default function PostsPageClient({ initialPosts }: PostsPageClientProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)

  // Auto-update scheduled posts to published when time passes
  useScheduledPostUpdater()

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social Media Posts</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage multi-platform content for Facebook, TikTok, Zalo, and YouTube
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSettings(true)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button
            onClick={() => setShowCreatePost(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Post
          </Button>
        </div>
      </div>

      {/* Posts View (List or Calendar) */}
      <PostsView initialPosts={initialPosts} />

      {/* Create Post Modal */}
      <PostFormModal
        open={showCreatePost}
        onClose={() => setShowCreatePost(false)}
      />

      {/* Settings Modal */}
      <PostContentSettings
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  )
}
