import { usePostStore } from '../_store/usePostStore'
import { usePostSettingStore } from '../_store/usePostSettingStore'
import { generatePlanAction } from '../_actions/generate-plan-action'
import { toast } from 'sonner'
import { createPlanAction } from '../_actions/create-planner-action'

export function useGenerateSchedule() {
  const { previewPosts, setPreviewPosts, clearPreviewPosts, setIsGeneratingSchedule } = usePostStore()
  const { brand, products } = usePostSettingStore()

  const generateSchedule = async () => {
    setIsGeneratingSchedule(true)

    try {
      // 1. Validate brand memory from store
      if (!brand.brandDescription || brand.brandDescription === 'Mô tả thương hiệu của bạn') {
        throw new Error('Please configure brand settings first')
      }

      // 2. Get selected products from store
      const selectedProducts = products.filter(p =>
        brand.selectedProductIds?.includes(p.id)
      )

      // 3. Call server action to generate schedule
      const result = await generatePlanAction({
        brandMemory: brand,
        selectedProducts
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate schedule')
      }

      // 4. Update store
      setPreviewPosts(result.schedule)
      toast.success(`Generated ${result.schedule.length} post ideas`)

      return result.schedule
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate'
      toast.error(message)
      return []
    } finally {
      setIsGeneratingSchedule(false)
    }
  }

  const saveSchedule = async () => {
    if (previewPosts.length === 0) {
      toast.error('No schedule to save. Please generate a schedule first.')
      return { success: false, savedCount: 0 }
    }

    try {
      const result = await createPlanAction(previewPosts)
      if (result.success) {
        clearPreviewPosts()
        toast.success(`Saved ${result.savedCount} posts successfully`)
        return { success: true, savedCount: result.savedCount }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save schedule'
      toast.error(message)
      return { success: false, savedCount: 0 }
    }
  }

  const undoSchedule = () => {
    if (previewPosts.length === 0) {
      toast.info('No schedule to undo. The preview is already empty.')
      return { success: false, discardedCount: 0 }
    }

    const count = previewPosts.length
    clearPreviewPosts()
    toast.info(`Discarded ${count} preview posts`)
    return { success: true, discardedCount: count }
  }

  return {
    generateSchedule,
    saveSchedule,
    undoSchedule,
    hasPreview: previewPosts.length > 0,
    previewCount: previewPosts.length
  }
}
