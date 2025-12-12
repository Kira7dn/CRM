import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

/**
 * Instagram Login (via Facebook OAuth)
 * - Required for Instagram Graph API
 * - Instagram Business must be linked to a Facebook Page
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

    // Instagram Graph API uses Facebook App credentials
    const appId = process.env.FACEBOOK_APP_ID
    const redirectUri =
      process.env.INSTAGRAM_REDIRECT_URI ||
      `${process.env.NEXTAUTH_URL}/api/auth/instagram/callback`

    if (!appId) {
      return NextResponse.json(
        { error: "Instagram integration not configured" },
        { status: 500 }
      )
    }

    // Generate CSRF state token
    const csrfState = Math.random().toString(36).substring(2)

    const response = NextResponse.redirect(
      buildFacebookOAuthUrl(appId, redirectUri, csrfState)
    )

    response.cookies.set("instagram_oauth_state", csrfState, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 mins
    })

    return response
  } catch (error) {
    console.error("Error initiating Instagram OAuth:", error)
    return NextResponse.json(
      { error: "Failed to initiate Instagram OAuth" },
      { status: 500 }
    )
  }
}

/**
 * Instagram Graph API uses Facebook OAuth
 */
const scope = [
  "instagram_basic",
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_metadata",
  "instagram_manage_comments",
  "instagram_manage_messages",
  "instagram_content_publish",
  "business_management", // Required to access Business Portfolio pages
].join(",")

function buildFacebookOAuthUrl(
  appId: string,
  redirectUri: string,
  state: string
): string {
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    scope,
    response_type: "code",
  })

  return `https://www.facebook.com/v23.0/dialog/oauth?${params.toString()}`
}
