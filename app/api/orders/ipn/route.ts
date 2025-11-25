import { NextRequest, NextResponse } from "next/server";
import { notifyOrderWebhook } from "@/lib/webhook";
import type { VnpayIpnRequest } from "@/infrastructure/adapters/gateways/vnpay-gateway";
import { handleVnpayIpnUseCase } from "../depends";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VnpayIpnRequest;

    const useCase = await handleVnpayIpnUseCase();
    const { result, order } = await useCase.execute({ body });

    // Send webhook notification if payment was successful
    if (result.isSuccess && order) {
      void notifyOrderWebhook(order);
    }

    return NextResponse.json({
      returnCode: result.returnCode,
      returnMessage: result.returnMessage,
    });
  } catch (error) {
    console.error('[VNPay IPN Route] Unexpected error:', error);
    return NextResponse.json(
      { returnCode: -1, returnMessage: "Internal server error" },
      { status: 500 }
    );
  }
}
