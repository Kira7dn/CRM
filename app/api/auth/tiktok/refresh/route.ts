import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ObjectId } from "mongodb"
import { createRefreshTikTokTokenUseCase } from "../depends"
import { refreshTikTokToken } from "@/infrastructure/adapters/external/social/auth/token-refresh-helpers"
import { SocialAuthRepository } from "@/infrastructure/repositories/social/social-auth-repo"

/**
 * POST /api/auth/tiktok/refresh
 * Manually refresh TikTok access token
 */
export async function POST(request: NextRequest) {
  try {
    // Get user ID from session
    const cookieStore = await cookies()
    const userIdCookie = cookieStore.get("admin_user_id")

    if (!userIdCookie) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      )
    }

    const userId = new ObjectId(userIdCookie.value)

    // Get current auth
    const repo = new SocialAuthRepository()
    const auth = await repo.getByUserAndPlatform(userId, "tiktok")

    if (!auth) {
      return NextResponse.json(
        { error: "TikTok account not connected" },
        { status: 404 }
      )
    }

    // Refresh the token via TikTok API
    const newTokenData = await refreshTikTokToken(auth.refreshToken)

    if (!newTokenData) {
      return NextResponse.json(
        { error: "Failed to refresh token. Please reconnect your TikTok account." },
        { status: 400 }
      )
    }

    // Update token in database
    const useCase = await createRefreshTikTokTokenUseCase()
    const result = await useCase.execute({
      userId,
      newAccessToken: newTokenData.access_token,
      newRefreshToken: newTokenData.refresh_token,
      expiresInSeconds: newTokenData.expires_in,
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
    console.error("TikTok token refresh error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Refresh failed" },
      { status: 500 }
    )
  }
}
