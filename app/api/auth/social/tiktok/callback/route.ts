import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ObjectId } from "mongodb"
import { createSaveTikTokTokenUseCase } from "../depends"

/**
 * GET /api/auth/tiktok/callback
 * Handles OAuth callback from TikTok
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Get base URL from env or request origin
    const baseUrl = process.env.APP_URL || request.nextUrl.origin

    // Check for OAuth errors
    if (error) {
      console.error("TikTok OAuth error:", error)
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=${encodeURIComponent(error)}`
      )
    }

    // Validate authorization code
    if (!code) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=missing_code`
      )
    }

    // Get and validate CSRF state
    const cookieStore = await cookies()
    const storedState = cookieStore.get("tiktok_oauth_state")

    if (!storedState || storedState.value !== state) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=invalid_state`
      )
    }

    // Get user ID from session
    const userIdCookie = cookieStore.get("admin_user_id")
    if (!userIdCookie) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=not_authenticated`
      )
    }

    const userId = new ObjectId(userIdCookie.value)

    // Exchange authorization code for access token
    const tokenResponse = await exchangeCodeForToken(code)
    console.log("tokenResponse", tokenResponse);

    if (!tokenResponse.success || !tokenResponse.data) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=${encodeURIComponent(
          tokenResponse.error || "token_exchange_failed"
        )}`
      )
    }

    // Save token to database
    const saveTokenUseCase = await createSaveTikTokTokenUseCase()
    const result = await saveTokenUseCase.execute({
      userId,
      openId: tokenResponse.data.open_id,
      pageName: tokenResponse.data.pageName,
      accessToken: tokenResponse.data.access_token,
      refreshToken: tokenResponse.data.refresh_token,
      expiresInSeconds: tokenResponse.data.expires_in,
      scope: tokenResponse.data.scope,
    })

    if (!result.success) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=${encodeURIComponent(
          result.message || "save_token_failed"
        )}`
      )
    }

    // Clear CSRF state cookie
    const response = NextResponse.redirect(
      `${baseUrl}/crm/social/connections?success=true`
    )
    response.cookies.delete("tiktok_oauth_state")

    return response
  } catch (error) {
    console.error("TikTok OAuth callback error:", error)
    const baseUrl = process.env.APP_URL || request.nextUrl.origin
    return NextResponse.redirect(
      `${baseUrl}/crm/social/connections?error=${encodeURIComponent(
        error instanceof Error ? error.message : "callback_failed"
      )}`
    )
  }
}

// Helper function to exchange authorization code for access token
async function exchangeCodeForToken(code: string): Promise<{
  success: boolean
  data?: {
    access_token: string
    refresh_token: string
    expires_in: number
    open_id: string
    pageName: string
    scope: string
  }
  error?: string
}> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET
  const redirectUri = process.env.TIKTOK_REDIRECT_URI

  if (!clientKey || !clientSecret || !redirectUri) {
    return {
      success: false,
      error: "TikTok configuration missing",
    }
  }

  try {
    const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    })

    const data = await response.json()
    console.log(data);

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error_description || data.error || "Token exchange failed",
      }
    }
    // Get user with page access tokens
    const userResponse = await fetch(
      `https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${data.access_token}`,
      },
    }
    )
    const userData = await userResponse.json()
    console.log(userData);

    return {
      success: true,
      data: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        open_id: data.open_id,
        pageName: userData.data.user.display_name,
        scope: data.scope,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    }
  }
}
