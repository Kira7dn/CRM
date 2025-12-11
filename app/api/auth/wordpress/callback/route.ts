import { NextRequest, NextResponse } from "next/server";
import { exchangeWordPressTokenUseCase } from "./depends";
import { cookies } from "next/headers";
import { getAppUrl } from "@/infrastructure/adapters/external/social/auth/wordpress-oauth-config";

/**
 * GET /api/auth/wordpress/callback
 * OAuth callback handler for WordPress
 * Query params:
 *   - code: OAuth authorization code
 *   - state: State parameter (should contain userId or session info)
 *   - siteUrl: WordPress site URL (for self-hosted)
 *   - wpcom: "1" for WordPress.com
 *   - siteId: WP.com site ID
 */
export async function GET(req: NextRequest) {
  const appUrl = getAppUrl();

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code) {
      return NextResponse.redirect(
        `${appUrl}/crm/social/connections?error=missing_code`
      );
    }

    // Get userId from cookies (state is just CSRF token, not userId)
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("admin_user_id");
    const userId = userIdCookie?.value;

    if (!userId) {
      console.error("[WordPress Callback] No admin_user_id cookie found");
      return NextResponse.redirect(
        `${appUrl}/crm/social/connections?error=unauthorized`
      );
    }

    console.log("[WordPress Callback] Processing callback for user:", userId);

    const useCase = await exchangeWordPressTokenUseCase();
    const result = await useCase.execute({
      code,
      userId,
    });

    console.log("[WordPress Callback] Connected site:", result.siteInfo.name, result.tokenData.blog_url);

    // Redirect back to connections page with success message
    return NextResponse.redirect(
      `${appUrl}/crm/social/connections?connected=wordpress`
    );
  } catch (err: any) {
    console.error("[WordPress Callback API] Error:", err);
    return NextResponse.redirect(
      `${appUrl}/crm/social/connections?error=${encodeURIComponent(err.message)}`
    );
  }
}
