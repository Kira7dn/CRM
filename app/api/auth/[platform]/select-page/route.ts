import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

import type { SocialPlatform } from "@/core/domain/social/social-auth"
import { ObjectId } from "mongodb"
import { redirectWithError } from "../depends"

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
        const body = await request.json()
        const { page_id, page_name, page_access_token, instagram_business_account_id } = body

        // Platform-specific validation
        if (platform === "facebook" || platform === "instagram") {
            if (!page_id || !page_name || !page_access_token) {
                return NextResponse.json(
                    { error: "Missing required fields: page_id, page_name, page_access_token" },
                    { status: 400 }
                )
            }
        }

        // For Instagram, only require instagram_business_account_id if it's not a basic connection
        if (platform === "instagram" && !instagram_business_account_id && !page_id.startsWith("instagram_user") && page_id !== "instagram_user") {
            return NextResponse.json(
                { error: "Missing required field: instagram_business_account_id for Instagram" },
                { status: 400 }
            )
        }

        // For Instagram basic connections, call the Instagram-specific endpoint
        if (platform === "instagram" && (page_id.startsWith("instagram_user") || page_id === "instagram_user")) {
            console.log(`[Select Page] Redirecting to Instagram-specific endpoint for basic connection`)

            try {
                const instagramResponse = await fetch(`${baseUrl}/api/auth/social/instagram/select-page`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Cookie": request.headers.get("cookie") || ""
                    },
                    body: JSON.stringify({
                        page_id,
                        page_name,
                        page_access_token,
                        instagram_business_account_id: page_id // Use page_id as fallback for basic connections
                    })
                })

                const result = await instagramResponse.json()
                return NextResponse.json(result, { status: instagramResponse.status })
            } catch (error) {
                console.error("Failed to call Instagram-specific endpoint:", error)
                return NextResponse.json(
                    { error: "Failed to process Instagram basic connection" },
                    { status: 500 }
                )
            }
        }

        // Subscribe to webhook messages for this page/platform
        // Skip webhook subscription for Instagram (handled by Instagram-specific endpoint)
        let subscribeResult: { success: boolean; error?: any } = { success: true }
        if (platform !== "instagram") {
            subscribeResult = await subscribeToWebhook(platform, page_id, page_access_token)
        } else {
            console.log(`Skipping webhook subscription for Instagram - handled by Instagram-specific endpoint`)
        }

        if (!subscribeResult.success) {
            return NextResponse.json(
                { error: "Failed to subscribe webhook", details: subscribeResult.error },
                { status: 500 }
            )
        }

        console.log(`Webhook subscribed for ${platform} page: ${page_name} (ID: ${page_id})`)

        // For now, return success - token saving should be handled by the main connect flow
        return NextResponse.json({
            success: true,
            message: `${platform === 'instagram' ? 'Instagram Business Account' : 'Facebook Page'} connected successfully`,
            page: {
                id: page_id,
                name: page_name,
                instagram_business_account_id,
            },
        })
    } catch (err) {
        const msg = err instanceof Error ? err.message : "select_page_unexpected_error"
        return redirectWithError(baseUrl, msg, platform)
    }
}

/**
 * Subscribe to webhook events for different platforms
 */
async function subscribeToWebhook(platform: SocialPlatform, pageId: string, accessToken: string): Promise<{
    success: boolean
    error?: any
}> {
    try {
        let subscribeUrl: string
        let subscribeFields: string

        switch (platform) {
            case "facebook":
                subscribeUrl = `https://graph.facebook.com/v23.0/${pageId}/subscribed_apps`
                subscribeFields = "messages,messaging_postbacks"
                break
            case "instagram":
                // Instagram webhooks are subscribed via the Facebook Page
                subscribeUrl = `https://graph.facebook.com/v23.0/${pageId}/subscribed_apps`
                subscribeFields = "instagram_messages,comments,story_insights"
                break
            default:
                return { success: false, error: "Webhook subscription not supported for this platform" }
        }

        const subscribeParams = new URLSearchParams({
            subscribed_fields: subscribeFields,
            access_token: accessToken,
        })

        const subscribeResponse = await fetch(`${subscribeUrl}?${subscribeParams.toString()}`, {
            method: "POST",
        })

        if (!subscribeResponse.ok) {
            const error = await subscribeResponse.json()
            console.error(`Failed to subscribe ${platform} webhook:`, error)
            return { success: false, error }
        }

        return { success: true }
    } catch (error) {
        console.error(`Error subscribing ${platform} webhook:`, error)
        return { success: false, error }
    }
}
