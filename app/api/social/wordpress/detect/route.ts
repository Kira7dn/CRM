import { NextRequest, NextResponse } from "next/server";
import { detectWordPressTypeUseCase } from "./depends";

/**
 * POST /api/social/wordpress/detect
 * Detect WordPress site type (WP.com, self-hosted with OAuth, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { siteUrl } = body;

    if (!siteUrl) {
      return NextResponse.json(
        { error: "Site URL is required" },
        { status: 400 }
      );
    }

    const useCase = await detectWordPressTypeUseCase();
    const result = await useCase.execute({ siteUrl });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[WordPress Detect API] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to detect WordPress type" },
      { status: 500 }
    );
  }
}
