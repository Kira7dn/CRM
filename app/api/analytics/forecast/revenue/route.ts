import { NextRequest, NextResponse } from "next/server";
import { createGetRevenueForecastUseCase } from "../depends";

/**
 * GET /api/analytics/forecast/revenue
 * Get revenue forecast for future periods
 *
 * Query params:
 * - daysAhead: number (required) - Number of days to forecast (1-90)
 * - model: "simple" | "ml" (optional) - Forecasting model to use
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const daysAhead = parseInt(searchParams.get("daysAhead") || "30");
    const model = searchParams.get("model") as "simple" | "ml" | undefined;

    const useCase = await createGetRevenueForecastUseCase();
    const result = await useCase.execute({ daysAhead, model });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get revenue forecast" },
      { status: 400 }
    );
  }
}
