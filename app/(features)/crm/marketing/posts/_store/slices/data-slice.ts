import type { StateCreator } from "zustand"
import type { Post } from "@/core/domain/marketing/post"
import type { PostStore } from "../types"

/**
 * Data Slice
 * Manages posts data, loading state, and month-based pagination
 */
export interface DataSlice {
  // State
  posts: Post[]
  filter: string
  previewPosts: Post[]
  isLoading: boolean
  hasLoaded: boolean
  serverProcessTime: number | null
  loadedMonths: Set<string>
  currentViewedMonth: string | null

  // Actions
  setPosts: (posts: Post[]) => void
  setFilter: (filter: string) => void
  setPreviewPosts: (posts: Post[]) => void
  clearPreviewPosts: () => void
  removePreviewPost: (id: string) => void
  loadPosts: (force?: boolean) => Promise<void>
  loadPostsByMonth: (year: number, month: number) => Promise<void>
  findPostById: (id: string) => Promise<Post | undefined>
}

export const createDataSlice: StateCreator<
  PostStore,
  [],
  [],
  DataSlice
> = (set, get) => ({
  // ===== Initial State =====
  posts: [],
  filter: "",
  previewPosts: [],
  isLoading: false,
  hasLoaded: false,
  serverProcessTime: null,
  loadedMonths: new Set<string>(),
  currentViewedMonth: null,

  // ===== Simple Setters =====
  setPosts: (posts) => set({ posts }),
  setFilter: (filter) => set({ filter }),
  setPreviewPosts: (posts) => set({ previewPosts: posts }),
  clearPreviewPosts: () => set({ previewPosts: [] }),

  removePreviewPost: (id: string) =>
    set((state) => ({
      previewPosts: state.previewPosts.filter((p) => p.id !== id),
    })),

  // ===== Data Loading =====
  loadPosts: async (force = false) => {
    const { isLoading, posts } = get()

    // Prevent duplicate API calls
    if (!force && (isLoading || posts.length > 0)) {
      return
    }

    // Load current month and adjacent months
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() // 0-11

    set({ isLoading: true })

    try {
      // Load current month, previous month, and next month
      await Promise.all([
        get().loadPostsByMonth(currentYear, currentMonth),
        get().loadPostsByMonth(
          currentMonth === 0 ? currentYear - 1 : currentYear,
          currentMonth === 0 ? 11 : currentMonth - 1
        ),
        get().loadPostsByMonth(
          currentMonth === 11 ? currentYear + 1 : currentYear,
          currentMonth === 11 ? 0 : currentMonth + 1
        ),
      ])

      set({ hasLoaded: true, isLoading: false })
    } catch (error) {
      console.error("[PostStore] Failed to load posts:", error)
      set({ isLoading: false, hasLoaded: true })
    }
  },

  loadPostsByMonth: async (year: number, month: number) => {
    const { loadedMonths, posts } = get()
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}` // Format: "YYYY-MM"

    // Skip if already loaded
    if (loadedMonths.has(monthKey)) {
      console.log(`[PostStore] Month ${monthKey} already loaded, skipping`)
      return
    }

    console.log(`[PostStore] Loading posts for ${monthKey}...`)

    try {
      const { getPostsAction } = await import("../../_actions/get-post-action")

      // Calculate date range for the month
      const startDate = new Date(year, month, 1, 0, 0, 0, 0)
      const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)

      const response = await getPostsAction({
        dateRange: {
          startDate,
          endDate
        }
      })

      console.log(`[PostStore] Loaded ${response.posts.length} posts for ${monthKey}`)

      // Merge new posts with existing posts (avoid duplicates)
      const existingIds = new Set(posts.map(p => p.id))
      const newPosts = response.posts.filter(p => !existingIds.has(p.id))

      set({
        posts: [...posts, ...newPosts],
        loadedMonths: new Set([...loadedMonths, monthKey]),
        serverProcessTime: response.serverProcessTime,
      })
    } catch (error) {
      console.error(`[PostStore] Failed to load posts for ${monthKey}:`, error)
    }
  },

  findPostById: async (id: string) => {
    const { posts, loadPosts } = get()

    // Try to find in cache
    const cached = posts.find((p) => p.id === id)
    if (cached) return cached

    // If not found, load posts
    await loadPosts()

    // Try again after loading
    return get().posts.find((p) => p.id === id)
  },
})
