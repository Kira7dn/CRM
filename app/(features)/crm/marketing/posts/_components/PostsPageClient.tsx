'use client'

import PostsView from './PostsView'
import PostHeader from './PostHeader'
import { Post } from '@/core/domain/marketing/post'

interface PostsPageClientProps {
  initialPosts: Post[]
}

export default function PostsPageClient({ initialPosts }: PostsPageClientProps) {
  return (
    <div className="space-y-6">
      <PostHeader />
      <PostsView initialPosts={initialPosts} />
    </div>
  )
}
