import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

function getAppUrl(): string {
  return (
    process.env.APP_URL ||
    process.env.NGROK_TUNNEL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}

/**
 * GET /api/auth/wordpress/start
 * Start WordPress OAuth flow with Jetpack
 */
export async function GET() {
  const appUrl = getAppUrl();

  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("admin_user_id");

    if (!userIdCookie) {
      return NextResponse.redirect(
        `${appUrl}/crm/social/connections?error=unauthorized`
      );
    }

    // Validate WordPress credentials
    const clientId = process.env.WP_CLIENT_ID;
    const redirectUri = process.env.WP_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      console.error("[WordPress Start] Missing credentials:", {
        hasClientId: !!clientId,
        hasRedirectUri: !!redirectUri,
      });
      return NextResponse.redirect(
        `${appUrl}/crm/social/connections?error=${encodeURIComponent("WordPress OAuth not configured")}`
      );
    }

    // Generate state for CSRF protection
    const state = crypto.randomBytes(16).toString("hex");

    // Store state in cookies for verification in callback
    cookieStore.set("wordpress_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    });

    // Build WordPress OAuth URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "posts media", // Request posts and media permissions
      state,
    });

    const authUrl = `https://public-api.wordpress.com/oauth2/authorize?${params.toString()}`;

    console.log("[WordPress Start] Redirecting to OAuth:", {
      redirectUri,
      state: state.substring(0, 8) + "...",
    });

    return NextResponse.redirect(authUrl);
  } catch (err: any) {
    console.error("[WordPress Start API] Error:", err);
    return NextResponse.redirect(
      `${appUrl}/crm/social/connections?error=${encodeURIComponent(err.message)}`
    );
  }
}
