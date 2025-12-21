/**
 * Post Schedule Generation API
 * Generate 1-month content calendar
 */

import { NextRequest, NextResponse } from "next/server"
import { GeneratePlanUseCase } from "@/core/application/usecases/marketing/post/generate-plan/generate-plan"
import { Product } from "@/core/domain/catalog/product"

export async function POST(request: NextRequest) {
  try {
    // const { startDate, endDate } = await request.json()

    // // Get selected products
    // let selectedProducts: Product[] = []
    // if (brandMemory.selectedProductIds && brandMemory.selectedProductIds.length > 0) {
    //   try {
    //     const productsRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products`)
    //     const allProducts = await productsRes.json()
    //     selectedProducts = allProducts.filter((p: Product) =>
    //       brandMemory.selectedProductIds?.includes(p.id)
    //     )
    //   } catch (error) {
    //     console.warn('[Schedule] Failed to load products:', error)
    //   }
    // }

    // // Generate schedule
    // const useCase = new GeneratePlanUseCase()
    // const result = await useCase.execute({
    //   brandMemory,
    //   products: selectedProducts,
    //   startDate: new Date(startDate),
    //   endDate: new Date(endDate),
    // })

    return NextResponse.json('demo')
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
