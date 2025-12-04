/**
 * Resource API Routes - Delete by ID
 * Handles DELETE /api/resources/[id]
 */

import { NextRequest, NextResponse } from "next/server"
import { deleteResourceUseCase } from "../depends"

/**
 * DELETE /api/resources/[id]
 * Delete a resource by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "Resource ID is required" },
        { status: 400 }
      )
    }

    const useCase = await deleteResourceUseCase()
    const result = await useCase.execute({ resourceId: id })

    return NextResponse.json(result)
  } catch (error) {
    console.error(`[API] DELETE /api/resources/${await (await params).id} error:`, error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete resource"
      },
      { status: 500 }
    )
  }
}
