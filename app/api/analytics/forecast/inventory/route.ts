import { NextRequest, NextResponse } from "next/server";
import { createGetInventoryForecastUseCase } from "../depends";

/**
 * GET /api/analytics/forecast/inventory
 * Get inventory demand forecast
 *
 * Query params:
 * - daysAhead: number (required) - Number of days to forecast (1-90)
 * - productId: number (optional) - Specific product ID to forecast
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const daysAhead = parseInt(searchParams.get("daysAhead") || "7");
    const productIdParam = searchParams.get("productId");
    const productId = productIdParam ? parseInt(productIdParam) : undefined;

    const useCase = await createGetInventoryForecastUseCase();
    const result = await useCase.execute({ daysAhead, productId });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get inventory forecast" },
      { status: 400 }
    );
  }
}
