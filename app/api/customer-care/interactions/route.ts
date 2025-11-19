import { NextRequest, NextResponse } from "next/server";
import {
  createInteractionUseCase,
  getAllInteractionsUseCase,
} from "./depends";

/**
 * GET /api/customer-care/interactions
 * Get all interactions with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters from query params
    const filters: any = {};

    if (searchParams.get("customerId")) {
      filters.customerId = searchParams.get("customerId");
    }
    if (searchParams.get("type")) {
      filters.type = searchParams.get("type");
    }
    if (searchParams.get("channel")) {
      filters.channel = searchParams.get("channel");
    }
    if (searchParams.get("direction")) {
      filters.direction = searchParams.get("direction");
    }
    if (searchParams.get("requiresFollowUp")) {
      filters.requiresFollowUp = searchParams.get("requiresFollowUp") === "true";
    }
    if (searchParams.get("startDate")) {
      filters.startDate = new Date(searchParams.get("startDate")!);
    }
    if (searchParams.get("endDate")) {
      filters.endDate = new Date(searchParams.get("endDate")!);
    }
    if (searchParams.get("limit")) {
      filters.limit = parseInt(searchParams.get("limit")!);
    }
    if (searchParams.get("offset")) {
      filters.offset = parseInt(searchParams.get("offset")!);
    }

    const useCase = await getAllInteractionsUseCase();
    const result = await useCase.execute({ filters });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch interactions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customer-care/interactions
 * Create a new interaction
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const useCase = await createInteractionUseCase();
    const result = await useCase.execute(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create interaction" },
      { status: 400 }
    );
  }
}
