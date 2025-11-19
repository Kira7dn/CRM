import { NextRequest, NextResponse } from "next/server";
import { calculateMetricsUseCase } from "../depends";

/**
 * GET /api/customer-care/surveys/[id]
 * Get survey metrics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");

    // Calculate metrics if requested
    if (action === "metrics") {
      const useCase = await calculateMetricsUseCase();
      const result = await useCase.execute({ surveyId: id });
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch survey" },
      { status: 500 }
    );
  }
}
