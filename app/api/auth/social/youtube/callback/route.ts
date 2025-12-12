import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ObjectId } from "mongodb"
import { createSaveYouTubeTokenUseCase } from "../depends"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Lấy base URL từ env hoặc origin request
    const baseUrl = process.env.APP_URL || request.nextUrl.origin

    if (error) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=${encodeURIComponent(error)}&platform=youtube`
      )
    }

    if (!code) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=missing_code&platform=youtube`
      )
    }

    const cookieStore = await cookies()
    const storedState = cookieStore.get("youtube_oauth_state")

    if (!storedState || storedState.value !== state) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=invalid_state&platform=youtube`
      )
    }

    const userIdCookie = cookieStore.get("admin_user_id")
    if (!userIdCookie) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=not_authenticated&platform=youtube`
      )
    }

    const userId = new ObjectId(userIdCookie.value)
    const tokenResponse = await exchangeCodeForToken(code)

    if (!tokenResponse.success || !tokenResponse.data) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=${encodeURIComponent(
          tokenResponse.error || "token_exchange_failed"
        )}&platform=youtube`
      )
    }

    const saveTokenUseCase = await createSaveYouTubeTokenUseCase()
    const result = await saveTokenUseCase.execute({
      userId,
      openId: tokenResponse.data.channel_id,
      pageName: tokenResponse.data.channel_name,
      accessToken: tokenResponse.data.access_token,
      refreshToken: tokenResponse.data.refresh_token,
      expiresInSeconds: tokenResponse.data.expires_in,
      scope: tokenResponse.data.scope,
    })

    if (!result.success) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=${encodeURIComponent(
          result.message || "save_token_failed"
        )}&platform=youtube`
      )
    }

    const response = NextResponse.redirect(
      `${baseUrl}/crm/social/connections?success=true&platform=youtube`
    )
    response.cookies.delete("youtube_oauth_state")

    return response
  } catch (error) {
    console.error("YouTube OAuth callback error:", error)
    const baseUrl = process.env.APP_URL || request.nextUrl.origin
    return NextResponse.redirect(
      `${baseUrl}/crm/social/connections?error=${encodeURIComponent(
        error instanceof Error ? error.message : "callback_failed"
      )}&platform=youtube`
    )
  }
}

async function exchangeCodeForToken(code: string): Promise<{
  success: boolean
  data?: {
    access_token: string
    refresh_token: string
    expires_in: number
    channel_id: string
    channel_name: string
    scope: string
  }
  error?: string
}> {
  const clientId = process.env.YOUTUBE_CLIENT_ID
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI

  if (!clientId || !clientSecret) {
    return { success: false, error: "YouTube configuration missing" }
  }

  try {
    if (!redirectUri) {
      throw new Error("Redirect URI is not configured")
    }

    const params = new URLSearchParams()
    params.append("code", code)
    params.append("client_id", clientId)
    params.append("client_secret", clientSecret)
    params.append("redirect_uri", redirectUri)
    params.append("grant_type", "authorization_code")

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok || tokenData.error) {
      return {
        success: false,
        error: tokenData.error_description || tokenData.error || "Token exchange failed",
      }
    }

    // Fetch YouTube channel information
    const channelInfoResponse = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    )

    if (!channelInfoResponse.ok) {
      const errorText = await channelInfoResponse.text()
      return { success: false, error: `Failed to fetch channel info: ${errorText}` }
    }

    const channelInfo = await channelInfoResponse.json()

    // Extract channel ID and name from items[0]
    if (!channelInfo.items || channelInfo.items.length === 0) {
      return {
        success: false,
        error: "No YouTube channel found for this account",
      }
    }

    const channelId = channelInfo.items[0].id
    const channelName = channelInfo.items[0].snippet.title

    if (!channelId || !channelName) {
      return {
        success: false,
        error: `Invalid channel data. Response: ${JSON.stringify(channelInfo.items[0])}`,
      }
    }

    return {
      success: true,
      data: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in || 3600,
        channel_id: channelId,
        channel_name: channelName,
        scope: tokenData.scope || "",
      },
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Network error" }
  }
}
