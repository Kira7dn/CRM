import { NextRequest, NextResponse } from "next/server";
import { getCustomerByIdUseCase } from "../depends";

/**
 * GET /api/customers/[id]
 * Fetch a customer by ID
 */
type RouteParams = {
  params: { id: string };
};

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const customerId = params.id;

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const useCase = await getCustomerByIdUseCase();
    const result = await useCase.execute({ id: customerId });

    if (!result.customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      customer: result.customer,
    });
  } catch (error) {
    console.error("Failed to fetch customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}
