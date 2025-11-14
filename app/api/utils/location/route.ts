import { NextRequest, NextResponse } from "next/server";
import { decodeLocationUseCase } from "./depends";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, accessToken } = body ?? {};

    if (!token) {
      return NextResponse.json({ message: "token là bắt buộc." }, { status: 400 });
    }

    if (!accessToken) {
      return NextResponse.json({ message: "accessToken là bắt buộc." }, { status: 400 });
    }

    console.log("token", token);
    console.log("accessToken", accessToken);

    const useCase = await decodeLocationUseCase();
    const result = await useCase.execute({
      token,
      accessToken,
    });

    console.log("location result", result);

    return NextResponse.json(result);

  } catch (error) {
    console.error("[decodeLocation] Unexpected error:", error);
    return NextResponse.json({
      message: "Đã xảy ra lỗi không mong muốn.",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
