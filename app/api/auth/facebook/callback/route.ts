import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ObjectId } from "mongodb"
import { createSaveFacebookTokenUseCase } from "../depends"

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

    const userId = new ObjectId(userIdCookie.value)
    const tokenResponse = await exchangeCodeForToken(code)

    if (!tokenResponse.success || !tokenResponse.data) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=${encodeURIComponent(
          tokenResponse.error || "token_exchange_failed"
        )}&platform=facebook`
      )
    }

    const saveTokenUseCase = await createSaveFacebookTokenUseCase()
    const tokenPaydload = {
      userId,
      openId: tokenResponse.data.page_id,
      pageName: tokenResponse.data.page_name,
      accessToken: tokenResponse.data.access_token,
      refreshToken: tokenResponse.data.refresh_token || tokenResponse.data.access_token,
      expiresInSeconds: tokenResponse.data.expires_in,
      scope: tokenResponse.data.scope,
    }
    console.log(tokenPaydload);

    const result = await saveTokenUseCase.execute(tokenPaydload)

    if (!result.success) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=${encodeURIComponent(
          result.message || "save_token_failed"
        )}&platform=facebook`
      )
    }

    const response = NextResponse.redirect(
      `${baseUrl}/crm/social/connections?success=true&platform=facebook`
    )
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

async function exchangeCodeForToken(code: string): Promise<{
  success: boolean
  data?: {
    access_token: string
    refresh_token?: string
    expires_in: number
    page_id: string
    page_name: string
    scope: string
  }
  error?: string
}> {
  const appId = process.env.FACEBOOK_APP_ID
  const appSecret = process.env.FACEBOOK_APP_SECRET
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/facebook/callback`

  if (!appId || !appSecret) {
    return { success: false, error: "Facebook configuration missing" }
  }

  try {
    // Exchange code for short-lived token
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

    // Exchange for long-lived token
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
    console.log(longLivedData);


    // Get user's pages with page access tokens
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v23.0/me/accounts?access_token=${longLivedData.access_token}`
    )
    const pagesData = await pagesResponse.json()
    console.log(pagesData);


    // Use the first page's access token (or you can let user choose)
    let pageAccessToken = longLivedData.access_token
    if (pagesData.data && pagesData.data.length > 0) {
      // Use the first page's token
      pageAccessToken = pagesData.data[0].access_token
      console.log(`Using page token for: ${pagesData.data[0].name} (ID: ${pagesData.data[0].id})`)
    } else {
      console.warn("No pages found, using user access token (posting may fail)")
    }

    return {
      success: true,
      data: {
        access_token: pageAccessToken, // Use page token instead of user token
        expires_in: longLivedData.expires_in || 5184000,
        page_id: pagesData.data[0].id,
        page_name: pagesData.data[0].name,
        scope: data.scope || "",
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    }
  }
}
