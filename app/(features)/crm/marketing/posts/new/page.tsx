import PostForm from '../_components/post-form/PostForm'
import { filterProductsUseCase } from '@/app/api/products/depends'
import { Product } from '@/core/domain/catalog/product'

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ scheduledAt?: string }>
}) {
  const { scheduledAt } = await searchParams

  // ===== parse schedule =====
  const initialScheduledAt = scheduledAt
    ? new Date(scheduledAt)
    : undefined


  // ===== bootstrap: products (USE CASE) =====
  const productUseCase = await filterProductsUseCase()
  const productResult = await productUseCase.execute({})

  const products: Product[] = productResult.products

  // ===== render =====
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
      <PostForm
        initialScheduledAt={initialScheduledAt}
      />
    </div>
  )
}
