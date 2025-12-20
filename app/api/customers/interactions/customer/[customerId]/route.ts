import { NextRequest, NextResponse } from "next/server";
import {
  getCustomerInteractionsUseCase,
  getCustomerSummaryUseCase,
} from "../../depends";

/**
 * GET /api/customer-care/interactions/customer/[customerId]
 * Get customer interactions or summary
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");

    // Get summary if requested
    if (action === "summary") {
      const useCase = await getCustomerSummaryUseCase();
      const result = await useCase.execute({ customerId });
      return NextResponse.json(result);
    }

    // Otherwise get interaction list
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;

    const useCase = await getCustomerInteractionsUseCase();
    const result = await useCase.execute({ customerId, limit });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch customer interactions" },
      { status: 500 }
    );
  }
}
