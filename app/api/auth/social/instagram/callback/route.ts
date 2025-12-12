import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { InstagramOAuthAdapter } from "@/infrastructure/adapters/external/social/oauth/instagram-oauth-adapter"

/**
 * Instagram OAuth Callback (via Facebook OAuth)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    const baseUrl = process.env.APP_URL || request.nextUrl.origin

    // OAuth Error
    if (error) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=${encodeURIComponent(error)}&platform=instagram`
      )
    }

    if (!code) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=missing_code&platform=instagram`
      )
    }

    /** Validate state (CSRF) */
    const cookieStore = await cookies()
    const storedState = cookieStore.get("instagram_oauth_state")

    if (!storedState || storedState.value !== state) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=invalid_state&platform=instagram`
      )
    }

    /** Check user authentication */
    const userIdCookie = cookieStore.get("admin_user_id")
    if (!userIdCookie) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=not_authenticated&platform=instagram`
      )
    }

    /** Exchange OAuth code → User access token */
    const adapter = new InstagramOAuthAdapter({
      appId: process.env.FACEBOOK_APP_ID!,
      appSecret: process.env.FACEBOOK_APP_SECRET!,
      redirectUri: process.env.INSTAGRAM_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/instagram/callback`
    })

    let tokenResponse;
    try {
      tokenResponse = await adapter.exchangeCodeForToken(code)
    } catch (error) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=${encodeURIComponent(
          error instanceof Error ? error.message : "token_exchange_failed"
        )}&platform=instagram`
      )
    }

    // Check if user has Facebook Pages but no Instagram Business Accounts
    const raw = tokenResponse.raw || {}
    if (raw.hasPages && !raw.hasInstagramAccounts) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=${encodeURIComponent(
          "No Instagram Business Accounts detected — link IG to a FB Page first."
        )}&platform=instagram`
      )
    }

    /** Redirect to UI with Page List for user selection */
    const pageSelectionUrl = `${baseUrl}/crm/social/instagram/select-page`
    const url = new URL(pageSelectionUrl)

    url.searchParams.set("user_token", tokenResponse.raw?.user_token || tokenResponse.accessToken)
    url.searchParams.set("pages", JSON.stringify(tokenResponse.raw?.pages || []))

    const response = NextResponse.redirect(url.toString())
    response.cookies.delete("instagram_oauth_state")

    return response
  } catch (error) {
    console.error("Instagram OAuth callback error:", error)
    const baseUrl = process.env.APP_URL || request.nextUrl.origin
    return NextResponse.redirect(
      `${baseUrl}/crm/social/connections?error=${encodeURIComponent(
        error instanceof Error ? error.message : "callback_failed"
      )}&platform=instagram`
    )
  }
}
