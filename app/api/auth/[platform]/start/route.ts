import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

import type { SocialPlatform } from "@/core/domain/social/social-auth"
import { createGetAuthorizationUrlUseCase, redirectWithError } from "../depends"

export async function GET(
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

    const userId = userCookie.value

    // Generate CSRF state token
    const csrfState = Math.random().toString(36).substring(2)

    // Get authorization URL from use case
    const useCase = createGetAuthorizationUrlUseCase()
    const result = await useCase.execute({
      platform,
      userId,
      state: csrfState,
    })

    if (!result.authorizationUrl) {
      return redirectWithError(baseUrl, "connect_failed", platform)
    }

    // Set state cookie for CSRF protection
    const response = NextResponse.redirect(result.authorizationUrl)
    response.cookies.set(`${platform}_oauth_state`, csrfState, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
    })

    return response
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "start_unexpected_error"

    return redirectWithError(baseUrl, msg, platform)
  }
}