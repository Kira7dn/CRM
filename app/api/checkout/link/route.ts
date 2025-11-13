import { NextRequest, NextResponse } from "next/server";
import { linkOrderUseCase } from "@/lib/container";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, checkoutSdkOrderId, miniAppId } = body;

    const result = await linkOrderUseCase.execute({
      orderId,
      checkoutSdkOrderId,
      miniAppId
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[linkOrder] Error:", error);
    return NextResponse.json({
      message: error instanceof Error ? error.message : String(error)
    }, { status: 400 });
  }
}
