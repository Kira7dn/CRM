import PostForm from '../_components/post-form2/PostForm'
import { filterProductsUseCase } from '@/app/api/products/depends'
import { Product, ProductPlain } from '@/core/domain/catalog/product'
import { getBrandMemoryAction } from '../_actions/brand-memory-action'

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

  // ===== bootstrap: brand memory =====
  const brandMemoryResult = await getBrandMemoryAction()
  const hasBrandMemory =
    brandMemoryResult.success && Boolean(brandMemoryResult.brandMemory)

  // ===== bootstrap: products (USE CASE) =====
  const productUseCase = await filterProductsUseCase()
  const productResult = await productUseCase.execute({})

  const products: ProductPlain[] = productResult.products.map(product => product.toPlain())

  // ===== render =====
  return (
    <PostForm
      initialScheduledAt={initialScheduledAt}
      products={products}
      hasBrandMemory={hasBrandMemory}
    />
  )
}
