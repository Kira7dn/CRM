import { NextRequest, NextResponse } from "next/server";
import { createPredictCustomerChurnUseCase } from "../depends";

/**
 * GET /api/analytics/forecast/churn
 * Get customer churn predictions
 *
 * Query params:
 * - customerId: string (optional) - Specific customer to check
 * - riskLevel: "low" | "medium" | "high" (optional) - Filter by risk level
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const customerId = searchParams.get("customerId") || undefined;
    const riskLevelFilter = searchParams.get("riskLevel") as
      | "low"
      | "medium"
      | "high"
      | undefined;

    const useCase = await createPredictCustomerChurnUseCase();
    const result = await useCase.execute({ customerId, riskLevelFilter });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to predict customer churn" },
      { status: 400 }
    );
  }
}
