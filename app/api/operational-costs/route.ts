import { NextRequest, NextResponse } from "next/server"
import { getCostsUseCase, createCostUseCase } from "./depends"

export async function GET(request: NextRequest) {
  try {
    const useCase = await getCostsUseCase()
    const result = await useCase.execute()
    return NextResponse.json(result.costs)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get costs" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const useCase = await createCostUseCase()
    const result = await useCase.execute(body)
    return NextResponse.json(result.cost, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create cost" },
      { status: 400 }
    )
  }
}
