'use client'

import PostList from './PostList'
import PostScheduler from './PostScheduler'
import PostFilter from './PostFilter'
import { Post } from '@/core/domain/marketing/post'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/@shared/ui/tabs'


export default function PostsView({ initialPosts }: {
  initialPosts: Post[]
}) {

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex flex-col items-center justify-between gap-2">
        <PostFilter />
        <Tabs defaultValue="calendar" className="">
          <TabsList className="">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar">
            <PostScheduler
              initialPosts={initialPosts}
            />
          </TabsContent>
          <TabsContent value="list">
            <PostList
              initialPosts={initialPosts}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
