/**
 * Post Schedule Generation API
 * Generate 1-month content calendar
 */

import { NextRequest, NextResponse } from "next/server"
import { GeneratePostScheduleUseCase } from "@/core/application/usecases/marketing/post/generate-post-schedule"
import { getBrandMemoryAction } from "@/app/(features)/crm/campaigns/posts/actions"

export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate } = await request.json()

    // Get brand memory
    const brandResult = await getBrandMemoryAction()
    if (!brandResult.success || !brandResult.brandMemory) {
      return NextResponse.json(
        { error: "Brand memory not configured. Please configure brand settings first." },
        { status: 400 }
      )
    }

    const brandMemory = brandResult.brandMemory

    // Get selected products
    let selectedProducts: any[] = []
    if (brandMemory.selectedProductIds && brandMemory.selectedProductIds.length > 0) {
      try {
        const productsRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products`)
        const allProducts = await productsRes.json()
        selectedProducts = allProducts.filter((p: any) =>
          brandMemory.selectedProductIds?.includes(p.id)
        )
      } catch (error) {
        console.warn('[Schedule] Failed to load products:', error)
      }
    }

    // Generate schedule
    const useCase = new GeneratePostScheduleUseCase()
    const result = await useCase.execute({
      brandMemory,
      products: selectedProducts,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[API] Schedule generation error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate schedule"
      },
      { status: 500 }
    )
  }
}
