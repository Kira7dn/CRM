import { NextRequest, NextResponse } from "next/server";
import { submitResponseUseCase } from "../depends";

/**
 * POST /api/customer-care/surveys/responses
 * Submit a survey response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const useCase = await submitResponseUseCase();
    const result = await useCase.execute(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to submit response" },
      { status: 400 }
    );
  }
}
