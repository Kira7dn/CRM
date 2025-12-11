import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAppUrl } from "@/infrastructure/adapters/external/social/auth/wordpress-oauth-config";

/**
 * GET /api/auth/wordpress/start
 * Start WordPress OAuth flow with site URL detection
 * This is a special endpoint that handles the UI workflow
 */
export async function GET(_req: NextRequest) {
  const appUrl = getAppUrl();

  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("admin_user_id");

    if (!userIdCookie) {
      return NextResponse.redirect(
        `${appUrl}/crm/social/connections?error=unauthorized`
      );
    }

    // For WordPress, we need the site URL first
    // Redirect to a page where user can enter their WordPress site URL
    return NextResponse.redirect(
      `${appUrl}/crm/social/connections/wordpress/setup`
    );
  } catch (err: any) {
    console.error("[WordPress Start API] Error:", err);
    return NextResponse.redirect(
      `${appUrl}/crm/social/connections?error=${encodeURIComponent(err.message)}`
    );
  }
}
