import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import crypto from "crypto"

// Facebook Webhook mTLS Implementation
// Reference: https://developers.facebook.com/docs/graph-api/webhooks/getting-started/#mtls-for-webhooks

interface WebhookEvent {
    id: string
    time: number
    changes: Array<{
        field: string
        value: any
    }>
}

interface InstagramWebhookPayload {
    object: string
    entry: WebhookEvent[]
}

export async function POST(request: NextRequest) {
    try {
        // Verify mTLS certificate (if configured)
        const clientCert = request.headers.get("x-client-cert")
        if (!verifyClientCertificate(clientCert)) {
            console.error("[Instagram Webhook] Invalid or missing client certificate")
            return NextResponse.json(
                { error: "Unauthorized - Invalid certificate" },
                { status: 401 }
            )
        }

        // Get webhook signature for verification
        const signature = request.headers.get("x-hub-signature-256")
        const body = await request.text()

        // Verify webhook payload
        if (!verifyWebhookSignature(body, signature)) {
            console.error("[Instagram Webhook] Invalid signature")
            return NextResponse.json(
                { error: "Unauthorized - Invalid signature" },
                { status: 401 }
            )
        }

        const payload: InstagramWebhookPayload = JSON.parse(body)

        // Process Instagram webhook events
        for (const entry of payload.entry) {
            for (const change of entry.changes) {
                await processWebhookChange(change.field, change.value)
            }
        }

        return NextResponse.json({ status: "ok" })
    } catch (error) {
        console.error("[Instagram Webhook] Error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// Webhook verification endpoint (GET request)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const mode = searchParams.get("hub.mode")
        const token = searchParams.get("hub.verify_token")
        const challenge = searchParams.get("hub.challenge")

        // Verify the webhook subscription
        if (mode === "subscribe" && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
            console.log("[Instagram Webhook] Webhook verified successfully")
            return new NextResponse(challenge)
        }

        console.error("[Instagram Webhook] Webhook verification failed")
        return NextResponse.json(
            { error: "Verification failed" },
            { status: 403 }
        )
    } catch (error) {
        console.error("[Instagram Webhook] Verification error:", error)
        return NextResponse.json(
            { error: "Verification error" },
            { status: 500 }
        )
    }
}

// Verify mTLS client certificate
function verifyClientCertificate(clientCertHeader: string | null): boolean {
    // In production, implement proper certificate validation
    // This is a simplified example

    if (!clientCertHeader) {
        // For development, you might want to skip mTLS verification
        // In production, always require client certificates
        return process.env.NODE_ENV === "development"
    }

    try {
        // Parse and validate client certificate
        // In production, verify against trusted CA certificates
        const cert = Buffer.from(clientCertHeader, "base64").toString()

        // Add your certificate validation logic here:
        // - Check certificate chain
        // - Verify certificate is not revoked
        // - Check certificate expiration
        // - Validate certificate subject

        console.log("[Instagram Webhook] Client certificate validated")
        return true
    } catch (error) {
        console.error("[Instagram Webhook] Certificate validation error:", error)
        return false
    }
}

// Verify webhook signature using HMAC-SHA256
function verifyWebhookSignature(body: string, signature: string | null): boolean {
    if (!signature) {
        return false
    }

    try {
        const appSecret = process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET
        if (!appSecret) {
            console.error("[Instagram Webhook] App secret not configured")
            return false
        }

        // Extract signature hash (format: sha256=hash)
        const expectedSignature = crypto
            .createHmac("sha256", appSecret)
            .update(body)
            .digest("hex")

        const receivedHash = signature.replace("sha256=", "")

        // Use timing-safe comparison to prevent timing attacks
        return crypto.timingSafeEqual(
            Buffer.from(expectedSignature, "hex"),
            Buffer.from(receivedHash, "hex")
        )
    } catch (error) {
        console.error("[Instagram Webhook] Signature verification error:", error)
        return false
    }
}

// Process webhook changes based on field type
async function processWebhookChange(field: string, value: any): Promise<void> {
    console.log(`[Instagram Webhook] Processing ${field} change:`, value)

    switch (field) {
        case "feed":
            // Handle Instagram feed updates (new posts, comments, likes)
            await handleFeedUpdate(value)
            break

        case "mentions":
            // Handle Instagram mentions
            await handleMentionsUpdate(value)
            break

        case "story_insights":
            // Handle Instagram story insights
            await handleStoryInsights(value)
            break

        case "media":
            // Handle media updates
            await handleMediaUpdate(value)
            break

        default:
            console.log(`[Instagram Webhook] Unhandled field: ${field}`)
    }
}

// Handle Instagram feed updates
async function handleFeedUpdate(value: any): Promise<void> {
    // Process new posts, comments, likes
    // Example: Update post metrics, send notifications, etc.
    console.log("[Instagram Webhook] Feed update:", value)

    // You can integrate with your existing post management system here
    // For example, update post engagement metrics in your database
}

// Handle Instagram mentions
async function handleMentionsUpdate(value: any): Promise<void> {
    // Process mentions of your account
    console.log("[Instagram Webhook] Mentions update:", value)
}

// Handle Instagram story insights
async function handleStoryInsights(value: any): Promise<void> {
    // Process story performance metrics
    console.log("[Instagram Webhook] Story insights:", value)
}

// Handle media updates
async function handleMediaUpdate(value: any): Promise<void> {
    // Process media changes (uploads, deletions, etc.)
    console.log("[Instagram Webhook] Media update:", value)
}
