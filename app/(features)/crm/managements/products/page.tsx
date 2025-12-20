import { filterProductsUseCase } from "@/app/api/products/depends"
import { getCategoriesUseCase } from "@/app/api/categories/depends"
import { ProductList } from "./_components/ProductList"

// Enable ISR with 60 second revalidation
export const revalidate = 60

export default async function ProductsPage() {
  // Get products and categories using injected use cases
  const productsUseCase = await filterProductsUseCase()
  const productsResult = await productsUseCase.execute({})

  const categoriesUseCase = await getCategoriesUseCase()
  const categoriesResult = await categoriesUseCase.execute()

  // Serialize to plain objects (convert Date objects)
  const products = JSON.parse(JSON.stringify(productsResult.products))
  const categories = JSON.parse(JSON.stringify(categoriesResult.categories))

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Product Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your seafood products and pricing
          </p>
        </div>

        {/* Product List */}
        <ProductList initialProducts={products} categories={categories} />
      </div>
    </div>
  )
}
