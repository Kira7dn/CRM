import { getPostsUseCase } from '@/app/api/posts/depends'
import PostsPageClient from './_components/PostsPageClient'

export default async function PostsPage() {
  const useCase = await getPostsUseCase()
  const result = await useCase.execute()
  const plainPosts = JSON.parse(JSON.stringify(result.posts))

  return (
    <PostsPageClient initialPosts={plainPosts} />
  )
}
