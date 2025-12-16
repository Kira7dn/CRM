import { useEffect, useState } from "react"
import { Product } from "@/core/domain/catalog/product"
import { getBrandMemoryAction } from "../../../_actions/brand-memory-action"

/**
 * Hook for loading initial data needed by PostForm
 *
 * Responsibilities:
 * - Load products list from API
 * - Check brand memory availability
 * - Provide loading state
 *
 * This is a BOOTSTRAP hook, runs once on mount
 */
export function usePostFormInitialData() {
  const [products, setProducts] = useState<Product[]>([])
  const [hasBrandMemory, setHasBrandMemory] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load brand memory status
        const brandMemoryResult = await getBrandMemoryAction()
        if (brandMemoryResult.success && brandMemoryResult.brandMemory) {
          setHasBrandMemory(true)
        }

        // Load products
        const res = await fetch('/api/products')
        const data = await res.json()
        const productsList: Product[] = data.map((p: Product) => ({
          id: p.id,
          name: p.name,
          url: p.url
        }))
        setProducts(productsList)
      } catch (error) {
        console.error('Failed to load initial data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])

  return {
    products,
    hasBrandMemory,
    isLoading
  }
}
