import type { Post } from "@/core/domain/marketing/post"
import type { PostPayload } from "@/core/application/interfaces/marketing/post-repo"
import { BrandMemory } from "@/core/domain/brand-memory"
import { Product } from "@/core/domain/catalog/product"

/**
 * Post Store State Interface
 */
export interface PostStoreState {
  // ===== Data State =====
  posts: Post[]
  filter: string
  previewPosts: Post[]

  // ===== Loading State =====
  isLoading: boolean
  hasLoaded: boolean
  serverProcessTime: number | null

  // ===== Month-based Loading =====
  loadedMonths: Set<string> // Format: "YYYY-MM"
  currentViewedMonth: string | null

  // ===== Schedule Generation =====
  isGeneratingSchedule: boolean
  isSavingSchedule: boolean
  saveProgress: number

  // ===== Modal State =====
  isPostFormModalOpen: boolean
  isDayScheduleDialogOpen: boolean
  isPostContentSettingsOpen: boolean
  selectedPost: Post | null
  selectedDate: Date | null
  isPostFormDirty: boolean

  // ===== Settings State =====
  brand: BrandMemory
  products: Product[]
  isLoadingProducts: boolean
  productsError?: string
}

/**
 * Post Store Actions Interface
 */
export interface PostStoreActions {
  // ===== Data Actions =====
  setPosts: (posts: Post[]) => void
  setFilter: (filter: string) => void
  loadPosts: (force?: boolean) => Promise<void>
  loadPostsByMonth: (year: number, month: number) => Promise<void>
  findPostById: (id: string) => Promise<Post | undefined>

  // ===== Preview Posts Actions =====
  setPreviewPosts: (posts: Post[]) => void
  clearPreviewPosts: () => void
  removePreviewPost: (id: string) => void

  // ===== CRUD Actions =====
  createPost: (payload: PostPayload) => Promise<{ success: boolean; post: Post }>
  updatePost: (postId: string, payload: PostPayload) => Promise<{ success: boolean; post: Post | null }>
  deletePost: (postId: string) => Promise<void>

  // ===== Modal Actions =====
  openPostFormModal: (post?: Post, date?: Date) => void
  closePostFormModal: (force?: boolean) => void
  setPostFormDirty: (isDirty: boolean) => void
  openDayScheduleDialog: (date: Date) => void
  closeDayScheduleDialog: () => void
  openPostContentSettings: () => void
  closePostContentSettings: () => void
  closeAllModals: () => void

  // ===== Settings Actions =====
  loadProducts: () => Promise<void>
  setBrand: (brand: BrandMemory) => void
  toggleProduct: (productId: string) => void
  resetSettings: () => void

  // ===== Schedule Generation Actions =====
  setIsGeneratingSchedule: (value: boolean) => void
  generateSchedule: (brandMemory: BrandMemory, selectedProducts: Product[]) => Promise<Post[]>
  saveSchedule: () => Promise<{ success: boolean; savedCount?: number }>
  undoSchedule: () => { success: boolean; discardedCount: number }
}

/**
 * Complete Post Store Interface
 */
export type PostStore = PostStoreState & PostStoreActions
