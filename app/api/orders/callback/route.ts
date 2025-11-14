import { NextRequest, NextResponse } from "next/server";
import { paymentCallbackUseCase } from "../depends";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, overallMac } = body;

    // Log received data - matches Express controller behavior
    console.debug("[paymentCallback] Data", { data });
    console.debug("[paymentCallback] OverallMac", { overallMac });

    if (!data || typeof overallMac !== "string") {
      return NextResponse.json({ returnCode: 0, returnMessage: "Thiếu dữ liệu callback" });
    }

    const useCase = await paymentCallbackUseCase();
    const result = await useCase.execute({
      data,
      overallMac
    });

    // Log success - matches Express controller behavior
    if (result.returnCode === 1 && result.order) {
      console.info("[paymentCallback] Đã cập nhật trạng thái đơn hàng", {
        orderId: result.order.id,
        paymentStatus: result.order.paymentStatus,
      });
    } else if (result.returnCode === 0) {
      // Log failures for debugging - matches Express controller behavior
      console.error("[paymentCallback] Cập nhật thất bại", {
        returnMessage: result.returnMessage,
        data
      });
    }

    return NextResponse.json({
      returnCode: result.returnCode,
      returnMessage: result.returnMessage
    });
  } catch (error) {
    // Detailed error logging - matches Express controller behavior
    console.error("[paymentCallback] Cập nhật trạng thái đơn hàng thất bại", {
      error: error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error,
    });

    return NextResponse.json({
      returnCode: 0,
      returnMessage: error instanceof Error ? error.message : String(error)
    });
  }
}
