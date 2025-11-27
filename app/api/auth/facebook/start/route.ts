import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

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

    const appId = process.env.FACEBOOK_APP_ID
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/facebook/callback`

    if (!appId) {
      return NextResponse.json(
        { error: "Facebook integration not configured" },
        { status: 500 }
      )
    }

    const csrfState = Math.random().toString(36).substring(2)

    const response = NextResponse.redirect(
      buildAuthUrl(appId, redirectUri, csrfState)
    )

    response.cookies.set("facebook_oauth_state", csrfState, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
    })

    return response
  } catch (error) {
    console.error("Error initiating Facebook OAuth:", error)
    return NextResponse.json(
      { error: "Failed to initiate Facebook OAuth" },
      { status: 500 }
    )
  }
}
const scope = [
  "pages_manage_engagement",
  "pages_read_engagement",
  "pages_manage_metadata",
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "publish_video"
].join(',');

function buildAuthUrl(appId: string, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    scope: scope,
    response_type: "code",
  })

  return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`
}
