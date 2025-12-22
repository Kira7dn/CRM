"use client"

import { create } from "zustand"
import { devtools, persist, createJSONStorage } from "zustand/middleware"
import type { PostStore } from "./types"
import { createModalSlice } from "./slices/modal-slice"
import { createDataSlice } from "./slices/data-slice"
import { createCrudSlice } from "./slices/crud-slice"
import { createPlannerSlice } from "./slices/planner-slice"
import { createSettingSlice } from "./slices/setting-slice"

/**
 * Post Store
 *
 * Combines multiple slices for better code organization:
 * - Modal Slice: Modal state management
 * - Data Slice: Posts data & loading
 * - CRUD Slice: Create, Update, Delete operations
 * - Planner Slice: AI schedule generation & batch saving
 * - Setting Slice: Brand settings and products
 */
export const usePostStore = create<PostStore>()(
  devtools(
    persist(
      (set, get, api) => ({
        ...createModalSlice(set, get, api),
        ...createDataSlice(set, get, api),
        ...createCrudSlice(set, get, api),
        ...createPlannerSlice(set, get, api),
        ...createSettingSlice(set, get, api),
      }),
      {
        name: 'post-store',
        storage: createJSONStorage(() => localStorage),
        // Persist only brand settings (not posts, modals, or loading states)
        partialize: (state) => ({
          brand: state.brand,
        }),
      }
    ),
    {
      name: "post-store", // Name for devtools
    }
  )
)
