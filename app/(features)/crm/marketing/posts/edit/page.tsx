import PostForm from '../_components/post-form/PostForm'

export default async function PostsPage({
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
  // ===== render =====
  return (
    <PostForm
      postId={id}
    />
  )
}
