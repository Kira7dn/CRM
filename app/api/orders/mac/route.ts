import { NextRequest, NextResponse } from "next/server";
import { macRequestUseCase } from "../depends";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, desc, item, extradata, method } = body;

    const useCase = await macRequestUseCase();
    const result = await useCase.execute({
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
