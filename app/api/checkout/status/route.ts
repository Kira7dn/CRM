import { NextRequest, NextResponse } from "next/server";
import { checkOrderStatusUseCase } from "@/lib/container";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const orderIdParam = url.searchParams.get("orderId");
    const orderId = orderIdParam ? Number(orderIdParam) : NaN;

    if (!orderIdParam || Number.isNaN(orderId)) {
      return NextResponse.json({ message: "orderId phải là số hợp lệ." }, { status: 400 });
    }

    const result = await checkOrderStatusUseCase.execute({ orderId });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[checkOrderStatus] Error:", error);
    return NextResponse.json({
      message: error instanceof Error ? error.message : String(error)
    }, { status: 404 });
  }
}
