"use client"

import { create } from "zustand"
import type { Post } from "@/core/domain/marketing/post"

export interface PostScheduleItem {
  title: string
  idea: string
  scheduledDate: string
  platform: string
}

interface PostStore {
  // ===== State =====
  posts: Post[]
  filter: string

  previewPosts: PostScheduleItem[]

  isGeneratingSchedule: boolean
  isLoading: boolean
  hasLoaded: boolean
  serverProcessTime: number | null

  // ===== Actions =====
  setPosts: (posts: Post[]) => void
  setFilter: (filter: string) => void

  setPreviewPosts: (posts: PostScheduleItem[]) => void
  clearPreviewPosts: () => void

  setIsGeneratingSchedule: (value: boolean) => void

  loadPosts: (force?: boolean) => Promise<void>
  findPostById: (id: string) => Promise<Post | undefined>
}

export const usePostStore = create<PostStore>((set, get) => ({
  // ===== Initial State =====
  posts: [],
  filter: "",

  previewPosts: [],

  isGeneratingSchedule: false,
  isLoading: false,
  hasLoaded: false,
  serverProcessTime: null,

  // ===== Simple setters =====
  setPosts: (posts) => set({ posts }),

  setFilter: (filter) => set({ filter }),

  setPreviewPosts: (posts) => set({ previewPosts: posts }),

  clearPreviewPosts: () => set({ previewPosts: [] }),

  setIsGeneratingSchedule: (value) =>
    set({ isGeneratingSchedule: value }),

  // ===== Async actions =====
  loadPosts: async (force = false) => {
    const { isLoading, posts } = get()

    // 👉 chống gọi API trùng
    if (!force && (isLoading || posts.length > 0)) {
      return
    }

    set({ isLoading: true })

    try {
      const { getPostsAction } = await import(
        "../_actions/get-post-action"
      )

      console.log("[PostStore] Loading posts...")
      const response = await getPostsAction()
      console.log("[PostStore] Server process time:", response.serverProcessTime, "ms")
      console.log("[PostStore] Posts loaded:", response.posts)

      set({
        posts: response.posts,
        isLoading: false,
        hasLoaded: true,
        serverProcessTime: response.serverProcessTime,
      })
    } catch (error) {
      console.error("[PostStore] Failed to load posts:", error)
      set({ isLoading: false, hasLoaded: true })
    }
  },
  findPostById: async (id: string) => {
    const { posts, loadPosts } = get()

    // 1️⃣ thử tìm trong cache
    const cached = posts.find(p => p.id === id)
    if (cached) return cached

    // 2️⃣ nếu chưa có → load
    await loadPosts()

    // 3️⃣ tìm lại sau load
    return get().posts.find(p => p.id === id)
  },
}))
