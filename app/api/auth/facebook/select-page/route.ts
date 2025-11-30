import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ObjectId } from "mongodb"
import { createSaveFacebookTokenUseCase } from "../depends"

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
    const body = await request.json()
    const { page_id, page_name, page_access_token } = body

    if (!page_id || !page_name || !page_access_token) {
      return NextResponse.json(
        { error: "Missing required fields: page_id, page_name, page_access_token" },
        { status: 400 }
      )
    }

    // Subscribe to webhook messages for this page
    const subscribeUrl = `https://graph.facebook.com/v23.0/${page_id}/subscribed_apps`
    const subscribeParams = new URLSearchParams({
      subscribed_fields: "messages,messaging_postbacks",
      access_token: page_access_token,
    })

    const subscribeResponse = await fetch(`${subscribeUrl}?${subscribeParams.toString()}`, {
      method: "POST",
    })

    if (!subscribeResponse.ok) {
      const error = await subscribeResponse.json()
      console.error("Failed to subscribe webhook:", error)
      return NextResponse.json(
        { error: "Failed to subscribe webhook", details: error },
        { status: 500 }
      )
    }

    console.log(`Webhook subscribed for page: ${page_name} (ID: ${page_id})`)

    // Save page token to database
    const saveTokenUseCase = await createSaveFacebookTokenUseCase()
    const result = await saveTokenUseCase.execute({
      userId,
      openId: page_id,
      pageName: page_name,
      accessToken: page_access_token,
      refreshToken: page_access_token, // Facebook page tokens don't have refresh tokens
      expiresInSeconds: 5184000, // 60 days default for page tokens
      scope: "pages_messaging,pages_manage_posts,pages_manage_engagement",
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "Failed to save token" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Facebook Page connected successfully",
      page: {
        id: page_id,
        name: page_name,
      },
    })
  } catch (error) {
    console.error("Error selecting Facebook page:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to select page" },
      { status: 500 }
    )
  }
}
