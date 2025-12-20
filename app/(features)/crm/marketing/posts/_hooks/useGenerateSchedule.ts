import { usePostStore } from '../_store/usePostStore'
import { usePostSettingStore } from '../_store/usePostSettingStore'
import { generateScheduleAction } from '../_actions/generate-schedule-action'
import { toast } from 'sonner'

export function useGenerateSchedule() {
  const { setPreviewPosts, setIsGeneratingSchedule } = usePostStore()
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
      const result = await generateScheduleAction({
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

  return { generateSchedule }
}
