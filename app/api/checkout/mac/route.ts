import { NextRequest, NextResponse } from "next/server";
import { macRequestUseCase } from "@/lib/container";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, desc, item, extradata, method } = body;

    const result = await macRequestUseCase.execute({
      amount,
      desc,
      item,
      extradata,
      method
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[macRequest] Error:", error);
    return NextResponse.json({
      message: error instanceof Error ? error.message : String(error)
    }, { status: 400 });
  }
}
