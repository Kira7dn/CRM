import { NextRequest, NextResponse } from "next/server";
import { createGetTrendAnalysisUseCase } from "../depends";

/**
 * GET /api/analytics/forecast/trends
 * Get trend analysis for metrics
 *
 * Query params:
 * - metric: "revenue" | "orders" | "customers" (required)
 * - period: "week" | "month" | "quarter" (required)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const metric = searchParams.get("metric") as
      | "revenue"
      | "orders"
      | "customers";
    const period = searchParams.get("period") as "week" | "month" | "quarter";

    if (!metric || !period) {
      return NextResponse.json(
        { error: "metric and period are required parameters" },
        { status: 400 }
      );
    }

    const useCase = await createGetTrendAnalysisUseCase();
    const result = await useCase.execute({ metric, period });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get trend analysis" },
      { status: 400 }
    );
  }
}
