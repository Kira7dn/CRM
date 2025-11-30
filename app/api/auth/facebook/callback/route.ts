import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Get base URL from env or request origin
    const baseUrl = process.env.APP_URL || request.nextUrl.origin

    if (error) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=${encodeURIComponent(error)}&platform=facebook`
      )
    }

    if (!code) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=missing_code&platform=facebook`
      )
    }

    const cookieStore = await cookies()
    const storedState = cookieStore.get("facebook_oauth_state")

    if (!storedState || storedState.value !== state) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=invalid_state&platform=facebook`
      )
    }

    const userIdCookie = cookieStore.get("admin_user_id")
    if (!userIdCookie) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=not_authenticated&platform=facebook`
      )
    }

    const tokenResponse = await exchangeCodeForToken(code)

    if (!tokenResponse.success || !tokenResponse.user_token || !tokenResponse.pages) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=${encodeURIComponent(
          tokenResponse.error || "token_exchange_failed"
        )}&platform=facebook`
      )
    }

    // Redirect to page selection UI with user_token and pages data
    const pageSelectionUrl = new URL(`${baseUrl}/crm/social/facebook/select-page`)
    pageSelectionUrl.searchParams.set("user_token", tokenResponse.user_token)
    pageSelectionUrl.searchParams.set("pages", JSON.stringify(tokenResponse.pages))

    const response = NextResponse.redirect(pageSelectionUrl.toString())
    response.cookies.delete("facebook_oauth_state")

    return response
  } catch (error) {
    console.error("Facebook OAuth callback error:", error)
    const baseUrl = process.env.APP_URL || request.nextUrl.origin
    return NextResponse.redirect(
      `${baseUrl}/crm/social/connections?error=${encodeURIComponent(
        error instanceof Error ? error.message : "callback_failed"
      )}&platform=facebook`
    )
  }
}

interface FacebookPage {
  id: string
  name: string
  access_token: string
  category?: string
  tasks?: string[]
}

async function exchangeCodeForToken(code: string): Promise<{
  success: boolean
  user_token?: string
  pages?: FacebookPage[]
  error?: string
}> {
  const appId = process.env.FACEBOOK_APP_ID
  const appSecret = process.env.FACEBOOK_APP_SECRET
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/facebook/callback`

  if (!appId || !appSecret) {
    return { success: false, error: "Facebook configuration missing" }
  }

  try {
    // Step 1: Exchange code for short-lived token
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      client_secret: appSecret,
      code,
    })

    const response = await fetch(
      `https://graph.facebook.com/v23.0/oauth/access_token?${params.toString()}`
    )

    const data = await response.json()

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || "Token exchange failed",
      }
    }

    // Step 2: Exchange for long-lived user token
    const longLivedParams = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: data.access_token,
    })

    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v23.0/oauth/access_token?${longLivedParams.toString()}`
    )

    const longLivedData = await longLivedResponse.json()
    console.log("Long-lived user token:", longLivedData)

    // Step 3: Get user's pages with page access tokens
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v23.0/me/accounts?access_token=${longLivedData.access_token}`
    )
    const pagesData = await pagesResponse.json()
    console.log("User pages:", pagesData)

    if (!pagesData.data || pagesData.data.length === 0) {
      return {
        success: false,
        error: "No Facebook Pages found for this account",
      }
    }

    // Return user token and ALL pages for user to choose
    return {
      success: true,
      user_token: longLivedData.access_token,
      pages: pagesData.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    }
  }
}
