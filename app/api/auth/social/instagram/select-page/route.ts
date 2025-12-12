import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ObjectId } from "mongodb"
import { createSaveInstagramTokenUseCase } from "../depends"

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
        const { page_id, page_name, page_access_token, instagram_business_account_id } = body

        if (!page_id || !page_name || !page_access_token || !instagram_business_account_id) {
            return NextResponse.json(
                { error: "Missing required fields: page_id, page_name, page_access_token, instagram_business_account_id" },
                { status: 400 }
            )
        }

        // Subscribe to Instagram webhook events using Facebook Page Access Token
        // Instagram webhooks are subscribed via the Facebook Page, not the Instagram Business Account
        const subscribeUrl = `https://graph.facebook.com/v21.0/${page_id}/subscribed_apps`
        const subscribeParams = new URLSearchParams({
            subscribed_fields: "feed,mention,story_share,message_mention,messages",
            access_token: page_access_token,
        })

        console.log("Subscribing to Instagram webhooks for Facebook Page ID:", page_id, "IGBA ID:", instagram_business_account_id)

        const subscribeResponse = await fetch(`${subscribeUrl}?${subscribeParams.toString()}`, {
            method: "POST",
        })

        let webhookSubscribed = false
        if (!subscribeResponse.ok) {
            const error = await subscribeResponse.json()
            console.error("Failed to subscribe Instagram webhook:", error)
            // Continue even if webhook subscription fails - token is still saved
        } else {
            console.log(`Instagram webhook subscribed successfully for Facebook Page ID: ${page_id}, IGBA ID: ${instagram_business_account_id}`)
            webhookSubscribed = true
        }

        // Save Instagram token to database
        const saveTokenUseCase = await createSaveInstagramTokenUseCase()
        const result = await saveTokenUseCase.execute({
            userId,
            accessToken: page_access_token,
            expiresIn: 5184000, // 60 days default for page tokens
            instagramBusinessAccountId: instagram_business_account_id,
            username: page_name,
            scopes: ["instagram_basic", "pages_show_list", "pages_read_engagement", "pages_manage_metadata", "instagram_manage_comments", "instagram_manage_messages", "instagram_content_publish"],
        })

        return NextResponse.json({
            success: true,
            channelId: result.channelId,
            webhookSubscribed,
            message: "Instagram Business Account connected successfully",
        })

    } catch (error) {
        console.error("Instagram select page error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to connect Instagram page" },
            { status: 500 }
        )
    }
}
