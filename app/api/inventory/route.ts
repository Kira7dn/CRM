import { NextRequest, NextResponse } from "next/server"
import { getAllInventorySummariesUseCase, recordStockMovementUseCase } from "./depends"

// GET /api/inventory - Get all inventory summaries (calculated from movements)
export async function GET(request: NextRequest) {
  try {
    const useCase = await getAllInventorySummariesUseCase()
    const result = await useCase.execute()
    return NextResponse.json(result.summaries)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get inventory summaries" },
      { status: 500 }
    )
  }
}

// POST /api/inventory - Record a new stock movement (IN/OUT/ADJUSTMENT/RETURN)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const useCase = await recordStockMovementUseCase()
    const result = await useCase.execute(body)
    return NextResponse.json(result.movement, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to record stock movement" },
      { status: 400 }
    )
  }
}

