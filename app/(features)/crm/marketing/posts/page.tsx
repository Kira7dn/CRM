import { getPostsUseCase } from '@/app/api/posts/depends'
import PostsPageClient from './_components/PostsPageClient'
import { PostsCopilotWrapper } from './_components/PostsCopilotWrapper'

// Enable ISR with 60 second revalidation
export const revalidate = 60

export default async function PostsPage() {
  const useCase = await getPostsUseCase()
  const result = await useCase.execute()
  const plainPosts = JSON.parse(JSON.stringify(result.posts))

  return (
    <PostsCopilotWrapper>
      <PostsPageClient initialPosts={plainPosts} />
    </PostsCopilotWrapper>
  )
}
