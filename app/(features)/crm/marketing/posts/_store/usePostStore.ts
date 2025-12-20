"use client"

import { create } from "zustand"
import type { Post } from "@/core/domain/marketing/post"

interface PostScheduleItem {
  title: string
  idea: string
  scheduledDate: string
  platform: string
}

interface PostStore {
  posts: Post[]
  filter: string
  previewPosts: PostScheduleItem[]
  isGeneratingSchedule: boolean
  setPosts: (posts: Post[]) => void
  setFilter: (filter: string) => void
  setPreviewPosts: (posts: PostScheduleItem[]) => void
  clearPreviewPosts: () => void
  setIsGeneratingSchedule: (value: boolean) => void
}

export const usePostStore = create<PostStore>((set) => ({
  posts: [],
  filter: "",
  previewPosts: [],
  isGeneratingSchedule: false,
  setPosts: (posts) => set({ posts }),
  setFilter: (filter) => set({ filter }),
  setPreviewPosts: (posts) => set({ previewPosts: posts }),
  clearPreviewPosts: () => set({ previewPosts: [] }),
  setIsGeneratingSchedule: (value) => set({ isGeneratingSchedule: value }),
}))
