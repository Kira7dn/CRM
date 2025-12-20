import { NextRequest, NextResponse } from "next/server";
import { markFollowedUpUseCase } from "../depends";

/**
 * PATCH /api/customer-care/interactions/[id]
 * Mark interaction as followed up
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if this is a follow-up action
    if (body.action === "mark-followed-up") {
      const useCase = await markFollowedUpUseCase();
      const result = await useCase.execute({ interactionId: id });
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update interaction" },
      { status: 500 }
    );
  }
}
