import PostForm from '../_components/post-form/PostForm'
import { getPostsAction } from '../_actions/get-post-action'

export default async function PostEditPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams
  if (!id) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Post ID Provided</h1>
          <p className="text-muted-foreground">Please provide a post ID to edit.</p>
        </div>
      </div>
    )
  }

  // Fetch the post - getPostsAction returns all posts, we need to find the one
  const result = await getPostsAction({})
  const post = result.posts.find(p => p.id === id)

  if (!post) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground">The post you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
      <PostForm post={post} />
    </div>
  )
}
