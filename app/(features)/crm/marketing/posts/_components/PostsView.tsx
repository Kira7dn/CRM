'use client'

import { useState } from 'react'
import { Button } from '@shared/ui/button'
import { Calendar as CalendarIcon, List } from 'lucide-react'
import PostList from './PostList'
import PostScheduler from './PostScheduler'
import PostFilter from './PostFilter'
import type { Post } from '@/core/domain/marketing/post'

type ViewMode = 'list' | 'calendar'

export default function PostsView({ initialPosts }: { initialPosts: Post[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <PostFilter />
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            List View
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <PostList initialPosts={initialPosts} />
      ) : (
        <PostScheduler initialPosts={initialPosts} />
      )}
    </div>
  )
}
