import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

import type { SocialPlatform } from "@/core/domain/social/social-auth"
import { ObjectId } from "mongodb"
import { createConnectSocialUseCase, redirectWithError } from "../depends"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: SocialPlatform }> }
) {
  const { platform } = await params
  const baseUrl = process.env.APP_URL || request.nextUrl.origin

  console.log(`[OAuth Callback] Starting callback for platform: ${platform}`)

  try {
    const url = new URL(request.url)
    const code = url.searchParams.get("code")
    const state = url.searchParams.get("state")
    const error = url.searchParams.get("error")

    console.log(`[OAuth Callback] Received params - code: ${!!code}, state: ${!!state}, error: ${error}`)

    if (error) {
      console.error(`[OAuth Callback] OAuth error for ${platform}:`, error)
      return redirectWithError(baseUrl, `oauth_error:${error}`, platform)
    }

    if (!code) {
      console.error(`[OAuth Callback] Missing code for ${platform}`)
      return redirectWithError(baseUrl, "missing_code", platform)
    }

    // Validate state anti-CSRF
    const cookieStore = await cookies()
    const stateCookieKey = `${platform}_oauth_state`
    const storedState = cookieStore.get(stateCookieKey)

    console.log(`[OAuth Callback] Validating state - cookie key: ${stateCookieKey}, stored: ${!!storedState}`)

    if (!storedState || storedState.value !== state) {
      console.error(`[OAuth Callback] Invalid state for ${platform} - expected: ${storedState?.value}, received: ${state}`)
      return redirectWithError(baseUrl, "invalid_state", platform)
    }

    // Ensure user is logged in
    const userCookie = cookieStore.get("admin_user_id")
    if (!userCookie) {
      console.error(`[OAuth Callback] User not authenticated for ${platform}`)
      return redirectWithError(baseUrl, "not_authenticated", platform)
    }

    const userId = userCookie.value
    console.log(`[OAuth Callback] User authenticated: ${userId}`)

    // Usecase factory per platform
    const connectUseCase = createConnectSocialUseCase()

    console.log(`[OAuth Callback] Executing connect use case for ${platform}`)
    const result = await connectUseCase.execute({
      userId: new ObjectId(userId),
      platform,
      code,
    })

    console.log(`[OAuth Callback] Connect result - success: ${result.success}, hasSocialAuth: ${!!result.socialAuth}, hasRaw: ${!!result.raw}`)

    if (!result.success) {
      console.error(`[OAuth Callback] Connect failed for ${platform}:`, result.message)
      return redirectWithError(
        baseUrl,
        result.message ?? "connect_failed",
        platform
      )
    }

    // SUCCESS — All pages already saved in ConnectSocialAccountUseCase
    cookieStore.delete(stateCookieKey)
    console.log(`[OAuth Callback] State cookie deleted for ${platform}`)

    console.log(`[OAuth Callback] Redirecting to success page for ${platform}`)
    return NextResponse.redirect(
      `${baseUrl}/crm/social/connections?success=true&platform=${platform}`
    )
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "callback_unexpected_error"

    console.error(`[OAuth Callback] Unexpected error for ${platform}:`, err)
    return redirectWithError(baseUrl, msg, platform)
  }
}
