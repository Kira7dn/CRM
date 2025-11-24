import { NextRequest, NextResponse } from "next/server"
import { updateCostUseCase, deleteCostUseCase } from "../depends"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const useCase = await updateCostUseCase()
    const result = await useCase.execute({
      ...body,
      id: parseInt(id)
    })
    return NextResponse.json(result.cost)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update cost" },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const useCase = await deleteCostUseCase()
    const result = await useCase.execute({ id: parseInt(id) })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete cost" },
      { status: 400 }
    )
  }
}
