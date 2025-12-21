import PostsPageClient from './_components/PostsPageClient'
import { PostsCopilot } from './_components/PostsCopilot'

// Enable ISR with 60 second revalidation
export const revalidate = 60

export default async function PostsPage() {

  return (
    <PostsCopilot>
      <PostsPageClient />
    </PostsCopilot>
  )
}
