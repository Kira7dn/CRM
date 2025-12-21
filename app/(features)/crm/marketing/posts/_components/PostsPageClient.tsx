'use client'

import PostHeader from './PostHeader'
import PostList from './PostList'
import PostScheduler from './PostScheduler'
import PostFilter from './PostFilter'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/tabs'
import { usePostStore } from '../_store/usePostStore'
import { useEffect } from 'react'
import { Loader } from 'lucide-react'

export default function PostsPageClient() {
  const { posts, loadPosts, isLoading, hasLoaded, serverProcessTime } = usePostStore()

  useEffect(() => {
    // Bắt đầu tính thời gian
    const startTime = performance.now()
    console.log('[PostsPageClient] Starting to load posts at:', startTime)

    loadPosts().then(() => {
      // Tính toán thời gian khi load xong
      const endTime = performance.now()
      const totalTime = endTime - startTime

      // Lấy server process time từ store
      const { serverProcessTime } = usePostStore.getState()

      console.log(`[PostsPageClient] Total load time: ${totalTime.toFixed(2)}ms`)
      if (serverProcessTime) {
        const networkTime = totalTime - serverProcessTime
        console.log(`[PostsPageClient] Server process time: ${serverProcessTime.toFixed(2)}ms`)
        console.log(`[PostsPageClient] Network + client processing time: ${networkTime.toFixed(2)}ms`)
      }
      console.log(`[PostsPageClient] Total time = client processing + network + server processing`)
    })
  }, [loadPosts])

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <PostHeader />
      <div className="flex flex-col items-center justify-between gap-2">
        {isLoading || !hasLoaded ? <div className="flex items-center justify-center py-8 w-full">
          <Loader className="h-6 w-6 animate-spin text-gray-500" />
        </div> :
          <div className="space-y-4 w-full">
            {/* Check if posts is empty */}
            {posts.length === 0 && hasLoaded ? (
              <div className="text-center py-12 px-4">
                <div className="text-gray-500 text-lg mb-2 sm:text-xl">No posts found</div>
                <div className="text-gray-400 text-sm sm:text-base">Create your first post to get started</div>
              </div>
            ) : (
              <>
                {/* View Toggle */}
                <PostFilter />
                <Tabs defaultValue="calendar" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:flex">
                    <TabsTrigger value="calendar" className="text-sm sm:text-base">Calendar View</TabsTrigger>
                    <TabsTrigger value="list" className="text-sm sm:text-base">List View</TabsTrigger>
                  </TabsList>
                  <TabsContent value="calendar" className="mt-4 sm:mt-6">
                    <PostScheduler
                      initialPosts={posts}
                    />
                  </TabsContent>
                  <TabsContent value="list" className="mt-4 sm:mt-6">
                    <PostList
                      initialPosts={posts}
                    />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>}
      </div>
    </div>
  )
}
