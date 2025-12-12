import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { createExchangeWordPressTokenUseCase, createSaveWordPressTokenUseCase } from "../depends";

/**
 * GET /api/auth/wordpress/callback
 * OAuth callback handler for WordPress Jetpack
 * Query params:
 *   - code: OAuth authorization code
 *   - state: State parameter (for CSRF protection)
 */
export async function GET(request: NextRequest) {
  // Get base URL from env or request origin
  const baseUrl = process.env.APP_URL || request.nextUrl.origin;

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=missing_code`
      );
    }

    // Get data from cookies
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("admin_user_id");
    const storedState = cookieStore.get("wordpress_oauth_state");

    const userId = userIdCookie?.value;

    if (!userId) {
      console.error("[WordPress Callback] No admin_user_id cookie found");
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=unauthorized`
      );
    }

    // Verify state for CSRF protection
    if (!storedState || state !== storedState.value) {
      console.error("[WordPress Callback] State mismatch:", {
        received: state,
        expected: storedState?.value,
      });
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=invalid_state`
      );
    }

    console.log("[WordPress Callback] Processing callback for user:", userId);

    // Get WordPress credentials
    const clientId = process.env.WP_CLIENT_ID;
    const clientSecret = process.env.WP_CLIENT_SECRET;
    const redirectUri = process.env.WP_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.error("[WordPress Callback] Missing credentials");
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=${encodeURIComponent("WordPress OAuth not configured")}`
      );
    }

    // Exchange code for token using use case
    const exchangeUseCase = await createExchangeWordPressTokenUseCase();
    const exchangeResult = await exchangeUseCase.execute({
      code,
      clientId,
      clientSecret,
      redirectUri,
    });

    if (!exchangeResult.success || !exchangeResult.accessToken || !exchangeResult.blogId) {
      console.error("[WordPress Callback] Token exchange failed:", exchangeResult.message);
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=${encodeURIComponent(exchangeResult.message || "Failed to exchange token")}`
      );
    }

    console.log("[WordPress Callback] Token exchange successful:", {
      blog_id: exchangeResult.blogId,
      blog_url: exchangeResult.blogUrl,
      scope: exchangeResult.scope,
    });

    // Save token to database using use case
    const saveUseCase = await createSaveWordPressTokenUseCase();
    const saveResult = await saveUseCase.execute({
      userId: new ObjectId(userId),
      blogId: exchangeResult.blogId,
      blogUrl: exchangeResult.blogUrl || "",
      accessToken: exchangeResult.accessToken,
      scope: exchangeResult.scope,
    });

    if (!saveResult.success) {
      console.error("[WordPress Callback] Failed to save token:", saveResult.message);
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=${encodeURIComponent(saveResult.message || "Failed to save token")}`
      );
    }

    console.log("[WordPress Callback] Token saved successfully");

    // Clear temporary cookies
    cookieStore.delete("wordpress_oauth_state");

    // Redirect back to connections page with success message
    return NextResponse.redirect(
      `${baseUrl}/crm/social/connections?success=true&platform=wordpress`
    );
  } catch (err: any) {
    console.error("[WordPress Callback API] Error:", err);
    return NextResponse.redirect(
      `${baseUrl}/crm/social/connections?error=${encodeURIComponent(err.message)}`
    );
  }
}