import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

/**
 * GET /api/auth/tiktok/start
 * Initiates TikTok OAuth flow by redirecting to TikTok authorization page
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userIdCookie = cookieStore.get("admin_user_id")

    if (!userIdCookie) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      )
    }

    // Get TikTok OAuth configuration from environment
    const clientKey = process.env.TIKTOK_CLIENT_KEY
    const redirectUri = process.env.TIKTOK_REDIRECT_URI

    if (!clientKey || !redirectUri) {
      console.error("TikTok OAuth configuration missing")
      return NextResponse.json(
        { error: "TikTok integration not configured" },
        { status: 500 }
      )
    }

    // Build TikTok authorization URL
    const csrfState = Math.random().toString(36).substring(2)

    // Store CSRF state in cookie for validation in callback
    const response = NextResponse.redirect(
      buildAuthUrl(clientKey, redirectUri, csrfState)
    )

    response.cookies.set("tiktok_oauth_state", csrfState, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    })

    return response
  } catch (error) {
    console.error("Error initiating TikTok OAuth:", error)
    return NextResponse.json(
      { error: "Failed to initiate TikTok OAuth" },
      { status: 500 }
    )
  }
}

// Helper function to build TikTok authorization URL
function buildAuthUrl(
  clientKey: string,
  redirectUri: string,
  state: string
): string {
  const params = new URLSearchParams({
    client_key: clientKey,
    scope: "user.info.basic,video.list,video.upload,video.publish", // Adjust scopes as needed
    response_type: "code",
    redirect_uri: redirectUri,
    state,
  })

  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
}
