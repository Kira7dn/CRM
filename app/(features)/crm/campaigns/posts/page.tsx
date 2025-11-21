import { getPostsUseCase } from '@/app/api/posts/depends'
import PostList from './_components/PostList'
import PostFilter from './_components/PostFilter'
import PostForm from './_components/PostForm'
import { Plus } from 'lucide-react'
import { Button } from '@shared/ui/button'

export default async function PostsPage() {
  const useCase = await getPostsUseCase()
  const result = await useCase.execute()
  const plainPosts = JSON.parse(JSON.stringify(result.posts))

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
      </div>

      {/* Create New Post Section */}
      <details className="bg-white dark:bg-gray-800 rounded-lg border" open>
        <summary className="px-6 py-4 cursor-pointer flex items-center gap-2 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <Plus className="h-5 w-5" />
          Create New Post
        </summary>
        <div className="border-t">
          <PostForm />
        </div>
      </details>

      {/* Filter */}
      <PostFilter />

      {/* Posts List */}
      <PostList initialPosts={plainPosts} />
    </div>
  )
}
