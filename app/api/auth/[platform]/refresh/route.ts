import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

import type { SocialPlatform } from "@/core/domain/social/social-auth"
import { createRefreshTokenUseCase, redirectWithError } from "../depends"
import { ObjectId } from "mongodb"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ platform: SocialPlatform }> }
) {
  const { platform } = await params
  const baseUrl = process.env.APP_URL || request.nextUrl.origin

  try {
    const cookieStore = await cookies()
    // Ensure user is logged in
    const userCookie = cookieStore.get("admin_user_id")
    if (!userCookie) {
      return redirectWithError(baseUrl, "not_authenticated", platform)
    }

    const userId = new ObjectId(userCookie.value)

    // Use case to refresh token
    const useCase = createRefreshTokenUseCase()
    const result = await useCase.execute({
      userId,
      platform,
    })

    if (!result.success) {
      return redirectWithError(
        baseUrl,
        result.message ?? "refresh_failed",
        platform
      )
    }

    return NextResponse.json(
      {
        message: "Token refreshed successfully",
        expiresAt: result.socialAuth?.expiresAt,
      },
      { status: 200 }
    )
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "refresh_unexpected_error"

    return redirectWithError(baseUrl, msg, platform)
  }
}
