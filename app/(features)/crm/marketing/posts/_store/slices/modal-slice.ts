import type { StateCreator } from "zustand"
import type { Post } from "@/core/domain/marketing/post"
import type { PostStore } from "../types"

/**
 * Modal Slice
 * Manages modal state (open/close, selected post/date)
 */
export interface ModalSlice {
  // State
  isPostFormModalOpen: boolean
  isDayScheduleDialogOpen: boolean
  isPostContentSettingsOpen: boolean
  selectedPost: Post | null
  selectedDate: Date | null
  isPostFormDirty: boolean // Track if post form has unsaved changes

  // Actions
  openPostFormModal: (post?: Post, date?: Date) => void
  closePostFormModal: (force?: boolean) => void // force: skip dirty check
  setPostFormDirty: (isDirty: boolean) => void
  openDayScheduleDialog: (date: Date) => void
  closeDayScheduleDialog: () => void
  openPostContentSettings: () => void
  closePostContentSettings: () => void
  closeAllModals: () => void
}

export const createModalSlice: StateCreator<
  PostStore,
  [],
  [],
  ModalSlice
> = (set, get) => ({
  // ===== Initial State =====
  isPostFormModalOpen: false,
  isDayScheduleDialogOpen: false,
  isPostContentSettingsOpen: false,
  selectedPost: null,
  selectedDate: null,
  isPostFormDirty: false,

  // ===== Actions =====
  openPostFormModal: (post, date) =>
    set({
      isPostFormModalOpen: true,
      selectedPost: post || null,
      selectedDate: date || null,
      isPostFormDirty: false, // Reset dirty state when opening
    }),

  closePostFormModal: (force = false) => {
    const state = get()

    // If form has unsaved changes and not forced, ask for confirmation
    if (!force && state.isPostFormDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      )
      if (!confirmed) {
        return // Don't close
      }
    }

    set({
      isPostFormModalOpen: false,
      selectedPost: null,
      isPostFormDirty: false,
    })
  },

  setPostFormDirty: (isDirty) =>
    set({ isPostFormDirty: isDirty }),

  openDayScheduleDialog: (date) =>
    set({
      isDayScheduleDialogOpen: true,
      selectedDate: date,
    }),

  closeDayScheduleDialog: () =>
    set({
      isDayScheduleDialogOpen: false,
      selectedDate: null,
    }),

  openPostContentSettings: () =>
    set({
      isPostContentSettingsOpen: true,
    }),

  closePostContentSettings: () =>
    set({
      isPostContentSettingsOpen: false,
    }),

  closeAllModals: () =>
    set({
      isPostFormModalOpen: false,
      isDayScheduleDialogOpen: false,
      isPostContentSettingsOpen: false,
      selectedPost: null,
    }),
})
