import PostHeader from "./_components/PostHeader"

export default async function PostLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-6">
      <PostHeader />
      {children}
    </div>
  )
}
