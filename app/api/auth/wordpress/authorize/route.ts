import { NextRequest, NextResponse } from "next/server";
import { getWordPressAuthorizationUrlUseCase } from "./depends";

/**
 * GET /api/auth/wordpress/authorize
 * Redirect to Jetpack OAuth authorization page
 * Works for both WordPress.com and self-hosted WordPress with Jetpack
 * Query params:
 *   - blogId: (Optional) WordPress.com blog ID to pre-select a site
 *   - state: (Optional) State parameter for CSRF protection
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    console.log(url.searchParams);

    const blogId = url.searchParams.get("blogId") || undefined;
    const state = url.searchParams.get("state") || Date.now().toString();

    const useCase = await getWordPressAuthorizationUrlUseCase();
    const { authorizationUrl } = useCase.execute({ blogId, state });

    return NextResponse.redirect(authorizationUrl);
  } catch (err: any) {
    console.error("[WordPress Authorize API] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate authorization URL" },
      { status: 500 }
    );
  }
}
