import { NextRequest, NextResponse } from "next/server";
import { createSurveyUseCase, getSurveysUseCase } from "./depends";

/**
 * GET /api/customer-care/surveys
 * Get all surveys with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters: any = {};

    if (searchParams.get("type")) {
      filters.type = searchParams.get("type");
    }
    if (searchParams.get("status")) {
      filters.status = searchParams.get("status");
    }
    if (searchParams.get("limit")) {
      filters.limit = parseInt(searchParams.get("limit")!);
    }
    if (searchParams.get("offset")) {
      filters.offset = parseInt(searchParams.get("offset")!);
    }

    const useCase = await getSurveysUseCase();
    const result = await useCase.execute({ filters });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch surveys" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customer-care/surveys
 * Create a new survey
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const useCase = await createSurveyUseCase();
    const result = await useCase.execute(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create survey" },
      { status: 400 }
    );
  }
}
