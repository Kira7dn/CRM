"use server"

import { GeneratePostScheduleUseCase } from '@/core/application/usecases/marketing/post/generate-plan/generate-schedule'
import { BrandMemory } from '@/core/domain/brand-memory'
import { Product } from '@/core/domain/catalog/product'

interface GenerateScheduleParams {
  brandMemory: BrandMemory
  selectedProducts: Product[]
}

export async function generateScheduleAction(params: GenerateScheduleParams) {
  try {
    const useCase = new GeneratePostScheduleUseCase()
    const startDate = new Date()
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const result = await useCase.execute({
      brandMemory: params.brandMemory,
      products: params.selectedProducts,
      startDate,
      endDate
    })

    return {
      success: true,
      schedule: result.schedule
    }
  } catch (error) {
    console.error('[GenerateScheduleAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate schedule',
      schedule: []
    }
  }
}
