import type { StateCreator } from "zustand"
import { BrandMemory } from "@/core/domain/brand-memory"
import { Product } from "@/core/domain/catalog/product"
import type { PostStore } from "../types"

/**
 * Initial Brand (pure domain)
 */
const initialBrand: BrandMemory = {
  brandDescription: 'Mô tả thương hiệu của bạn',
  niche: 'Thị trường ngách của bạn',
  contentStyle: 'professional',
  language: 'vietnamese',
  brandVoice: {
    tone: 'Giọng văn thương hiệu',
    writingPatterns: [
      "Đặt câu hỏi về vấn đề hiện tại của doanh nghiệp",
      "Mô tả kịch bản vận hành thực tế",
      "Kết luận bằng định hướng hành động hoặc gợi ý giải pháp"
    ]
  },
  ctaLibrary: [],
  keyPoints: [],
  contentsInstruction: '',
  selectedProductIds: [],
}

/**
 * Setting Slice
 * Manages brand settings and products for AI generation
 */
export interface SettingSlice {
  // State
  brand: BrandMemory
  products: Product[]
  isLoadingProducts: boolean
  productsError?: string

  // Actions
  loadProducts: () => Promise<void>
  setBrand: (brand: BrandMemory) => void
  toggleProduct: (productId: string) => void
  resetSettings: () => void
}

export const createSettingSlice: StateCreator<
  PostStore,
  [],
  [],
  SettingSlice
> = (set, get) => ({
  // ===== Initial State =====
  brand: initialBrand,
  products: [],
  isLoadingProducts: false,
  productsError: undefined,

  // ===== Actions =====
  loadProducts: async () => {
    try {
      set({ isLoadingProducts: true, productsError: undefined })

      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Failed to load products')

      const products: Product[] = await res.json()

      set({
        products,
        isLoadingProducts: false,
      })
    } catch (err: any) {
      set({
        productsError: err.message ?? 'Unknown error',
        isLoadingProducts: false,
      })
    }
  },

  setBrand: (brand) => set({ brand }),

  toggleProduct: (productId: string) => {
    const { brand } = get()
    const selected = new Set(brand.selectedProductIds)

    selected.has(productId)
      ? selected.delete(productId)
      : selected.add(productId)

    set({
      brand: {
        ...brand,
        selectedProductIds: Array.from(selected),
      },
    })
  },

  resetSettings: () =>
    set({
      brand: initialBrand,
      products: [],
      isLoadingProducts: false,
      productsError: undefined,
    }),
})
