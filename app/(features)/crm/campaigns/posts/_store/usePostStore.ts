"use client"

import { create } from "zustand"
import type { Post } from "@/core/domain/managements/post"

interface PostStore {
  posts: Post[]
  filter: string
  setPosts: (posts: Post[]) => void
  setFilter: (filter: string) => void
}

export const usePostStore = create<PostStore>((set) => ({
  posts: [],
  filter: "",
  setPosts: (posts) => set({ posts }),
  setFilter: (filter) => set({ filter }),
}))
