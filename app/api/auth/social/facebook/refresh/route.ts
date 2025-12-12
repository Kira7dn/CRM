import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ObjectId } from "mongodb"
import { createRefreshFacebookTokenUseCase } from "../depends"
import { SocialAuthRepository } from "@/infrastructure/repositories/social/social-auth-repo"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userIdCookie = cookieStore.get("admin_user_id")

    if (!userIdCookie) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      )
    }

    const userId = new ObjectId(userIdCookie.value)
    const repo = new SocialAuthRepository()
    const auth = await repo.getByUserAndPlatform(userId, "facebook")

    if (!auth) {
      return NextResponse.json(
        { error: "Facebook account not connected" },
        { status: 404 }
      )
    }

    const newTokenData = await refreshFacebookToken(auth.accessToken)

    if (!newTokenData) {
      return NextResponse.json(
        { error: "Failed to refresh token. Please reconnect your Facebook account." },
        { status: 400 }
      )
    }

    const useCase = await createRefreshFacebookTokenUseCase()
    const result = await useCase.execute({
      userId,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "Failed to update token" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: "Token refreshed successfully",
        expiresAt: result.socialAuth?.expiresAt,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Facebook token refresh error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Refresh failed" },
      { status: 500 }
    )
  }
}

async function refreshFacebookToken(currentToken: string): Promise<{
  access_token: string
  expires_in: number
} | null> {
  const appId = process.env.FACEBOOK_APP_ID
  const appSecret = process.env.FACEBOOK_APP_SECRET

  if (!appId || !appSecret) {
    return null
  }

  try {
    const params = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: currentToken,
    })

    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`
    )

    const data = await response.json()

    if (!response.ok || data.error) {
      console.error("Failed to refresh Facebook token:", data.error)
      return null
    }

    console.log("Facebook API response:", {
      expires_in: data.expires_in,
      using_default: !data.expires_in,
      final_expires_in: data.expires_in || 5184000,
    })

    return {
      access_token: data.access_token,
      expires_in: data.expires_in || 5184000,
    }
  } catch (error) {
    console.error("Error refreshing Facebook token:", error)
    return null
  }
}
