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

    const clientId = process.env.YOUTUBE_CLIENT_ID
    const redirectUri = process.env.YOUTUBE_REDIRECT_URI

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { error: "YouTube integration not configured" },
        { status: 500 }
      )
    }

    const csrfState = Math.random().toString(36).substring(2)

    const response = NextResponse.redirect(
      buildAuthUrl(clientId, redirectUri, csrfState)
    )

    response.cookies.set("youtube_oauth_state", csrfState, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
    })

    return response
  } catch (error) {
    console.error("Error initiating YouTube OAuth:", error)
    return NextResponse.json(
      { error: "Failed to initiate YouTube OAuth" },
      { status: 500 }
    )
  }
}

function buildAuthUrl(clientId: string, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid profile https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.force-ssl",
    access_type: "offline",
    prompt: "consent",
    state,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}
