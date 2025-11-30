import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ObjectId } from "mongodb"
import { createRefreshYouTubeTokenUseCase } from "../depends"
import { SocialAuthRepository } from "@/infrastructure/repositories/social/social-auth-repo"
import { refreshYouTubeToken } from "@/infrastructure/adapters/external/social/auth/token-refresh-helpers"

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
    const auth = await repo.getByUserAndPlatform(userId, "youtube")

    if (!auth) {
      return NextResponse.json(
        { error: "YouTube account not connected" },
        { status: 404 }
      )
    }

    const newTokenData = await refreshYouTubeToken(auth.refreshToken)

    if (!newTokenData) {
      return NextResponse.json(
        { error: "Failed to refresh token. Please reconnect your YouTube account." },
        { status: 400 }
      )
    }

    const useCase = await createRefreshYouTubeTokenUseCase()
    const result = await useCase.execute({
      userId,
      newAccessToken: newTokenData.access_token,
      newRefreshToken: auth.refreshToken, // YouTube refresh tokens don't change
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
    console.error("YouTube token refresh error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Refresh failed" },
      { status: 500 }
    )
  }
}
