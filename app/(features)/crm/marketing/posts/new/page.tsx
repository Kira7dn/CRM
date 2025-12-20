import PostForm from '../_components/post-form/PostForm'
import { filterProductsUseCase } from '@/app/api/products/depends'
import { ProductPlain } from '@/core/domain/catalog/product'

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

  const products: ProductPlain[] = productResult.products.map(product => product.toPlain())

  // ===== render =====
  return (
    <PostForm
      initialScheduledAt={initialScheduledAt}
      products={products}
    />
  )
}
