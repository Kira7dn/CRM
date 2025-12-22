import type { StateCreator } from "zustand"
import type { Post } from "@/core/domain/marketing/post"
import { BrandMemory } from "@/core/domain/brand-memory"
import { Product } from "@/core/domain/catalog/product"
import { toast } from "@shared/hooks/use-toast"
import type { PostStore } from "../types"

/**
 * Planner Slice
 * Manages AI schedule generation and batch saving
 */
export interface PlannerSlice {
  // State
  isGeneratingSchedule: boolean
  isSavingSchedule: boolean
  saveProgress: number

  // Actions
  setIsGeneratingSchedule: (value: boolean) => void
  generateSchedule: (brandMemory: BrandMemory, selectedProducts: Product[]) => Promise<Post[]>
  savePlannerPosts: () => Promise<{ success: boolean; savedCount?: number }>
  undoSchedule: () => { success: boolean; discardedCount: number }
}

export const createPlannerSlice: StateCreator<
  PostStore,
  [],
  [],
  PlannerSlice
> = (set, get) => ({
  // ===== Initial State =====
  isGeneratingSchedule: false,
  isSavingSchedule: false,
  saveProgress: 0,

  // ===== Actions =====
  setIsGeneratingSchedule: (value) =>
    set({ isGeneratingSchedule: value }),

  // ===== GENERATE SCHEDULE =====
  generateSchedule: async (brandMemory: BrandMemory, selectedProducts: Product[]) => {
    set({ isGeneratingSchedule: true })

    try {
      // Validate brand memory
      if (!brandMemory.brandDescription || brandMemory.brandDescription === 'Mô tả thương hiệu của bạn') {
        throw new Error('Please configure brand settings first')
      }

      const { generatePlanAction } = await import("../../_actions/generate-plan-action")

      const result = await generatePlanAction({
        brandMemory,
        selectedProducts,
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate schedule')
      }

      set({ previewPosts: result.schedule })
      toast({
        title: `Generated ${result.schedule.length} post ideas`,
      })

      return result.schedule
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate'
      toast({
        title: message,
        variant: "destructive",
      })
      return []
    } finally {
      set({ isGeneratingSchedule: false })
    }
  },

  // ===== SAVE PLANNER POSTS (STREAMING) =====
  savePlannerPosts: async () => {
    const { previewPosts } = get()

    if (previewPosts.length === 0) {
      toast({
        title: 'No schedule to save',
        description: 'Please generate a schedule first.',
        variant: "destructive",
      })
      return { success: false, savedCount: 0 }
    }

    const totalPosts = previewPosts.length
    let savedCount = 0
    let failedCount = 0
    const errors: Array<{ idea: string; error: string }> = []

    try {
      // Set saving state
      set({ isSavingSchedule: true, saveProgress: 0 })

      // Show initial progress toast
      const progressToast = toast({
        title: `Saving ${totalPosts} posts...`,
        description: `0 / ${totalPosts} posts saved (0%)`,
        duration: Infinity,
      })

      // Call streaming API
      const response = await fetch('/api/posts/batch-save/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: previewPosts }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      // Read streaming response
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true })

        // Process complete events (separated by \n\n)
        const events = buffer.split('\n\n')
        buffer = events.pop() || '' // Keep incomplete event in buffer

        for (const event of events) {
          if (!event.trim() || event.startsWith(':')) continue

          // Parse SSE event
          const dataMatch = event.match(/^data: (.+)$/m)
          if (!dataMatch) continue

          try {
            const data = JSON.parse(dataMatch[1])

            switch (data.type) {
              case 'start':
                console.log('[BatchSave] Started:', data)
                break

              case 'progress':
                savedCount = data.savedCount
                failedCount = data.failedCount || 0

                set({ saveProgress: data.progress })

                // Update toast with real-time progress
                progressToast.update({
                  id: progressToast.id,
                  open: true,
                  title: `Saving ${totalPosts} posts...`,
                  description: `${savedCount} / ${totalPosts} posts saved (${data.progress}%)`,
                  duration: Infinity,
                })
                break

              case 'item-error':
                errors.push({ idea: data.idea, error: data.error })
                console.error('[BatchSave] Item failed:', data)
                break

              case 'complete':
                savedCount = data.savedCount
                failedCount = data.failedCount
                errors.push(...(data.errors || []))
                console.log('[BatchSave] Completed:', data)
                break

              case 'error':
                throw new Error(data.message)
            }
          } catch (parseError) {
            console.error('[BatchSave] Failed to parse event:', event, parseError)
          }
        }
      }

      // Reload posts to get fresh data
      await get().loadPosts(true)

      set({
        previewPosts: [],
        saveProgress: 100,
        isSavingSchedule: false,
      })

      // Update toast to show completion
      if (failedCount > 0) {
        progressToast.update({
          id: progressToast.id,
          open: true,
          title: `⚠ Saved ${savedCount} of ${totalPosts} posts`,
          description: `${savedCount} saved, ${failedCount} failed`,
          variant: "default",
        })
      } else {
        progressToast.update({
          id: progressToast.id,
          open: true,
          title: `✓ Saved ${savedCount} posts successfully`,
          description: `All ${totalPosts} posts saved`,
        })
      }

      // Auto dismiss after 2 seconds
      setTimeout(() => {
        progressToast.dismiss()
      }, 2000)

      return { success: true, savedCount }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save schedule'

      set({ isSavingSchedule: false, saveProgress: 0 })

      toast({
        title: '✗ Save failed',
        description: message,
        variant: "destructive",
      })

      return { success: false, savedCount: 0 }
    }
  },

  // ===== UNDO SCHEDULE =====
  undoSchedule: () => {
    const { previewPosts } = get()

    if (previewPosts.length === 0) {
      toast({
        title: 'No schedule to undo',
        description: 'The preview is already empty.',
      })
      return { success: false, discardedCount: 0 }
    }

    const count = previewPosts.length
    set({ previewPosts: [] })
    toast({
      title: `Discarded ${count} preview posts`,
    })
    return { success: true, discardedCount: count }
  },
})
