import { NextRequest, NextResponse } from "next/server";
import { receiveMessageUseCase } from "@/app/api/messaging/depends";
import { broadcastEvent } from "@/app/api/events/stream";
import crypto from "crypto";

/**
 * TikTok Business Messaging Webhook
 *
 * Handles incoming messages and events from TikTok Business Messaging
 *
 * Reference: https://developers.tiktok.com/doc/webhooks-overview
 */

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || "";
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || "";

/**
 * GET: Webhook Verification
 * TikTok sends a verification request when you set up the webhook
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const challenge = url.searchParams.get("challenge");

    console.log('[TikTok Webhook] Verification request:', { challenge });

    if (challenge) {
      console.log('[TikTok Webhook] Webhook verified successfully');
      return new NextResponse(challenge, { status: 200 });
    }

    console.error('[TikTok Webhook] Verification failed: No challenge');
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[TikTok Webhook] Verification error:', error);
    return NextResponse.json(
      { error: "Verification error" },
      { status: 500 }
    );
  }
}

/**
 * POST: Receive Messages and Events
 * TikTok sends message events to this endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-tiktok-signature");

    // Verify webhook signature for security
    if (CLIENT_SECRET && signature) {
      const isValid = verifySignature(body, signature, CLIENT_SECRET);
      if (!isValid) {
        console.error('[TikTok Webhook] Invalid signature');
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 403 }
        );
      }
    }

    const data = JSON.parse(body);
    console.log('[TikTok Webhook] Received payload:', JSON.stringify(data, null, 2));

    // Process the event
    await processEvent(data);

    return NextResponse.json({ code: 0, message: "success" });
  } catch (error: any) {
    console.error('[TikTok Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { code: 1, message: "Webhook processing error", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Process a TikTok webhook event
 */
async function processEvent(data: any) {
  const eventType = data.event;

  console.log('[TikTok Webhook] Processing event:', eventType);

  switch (eventType) {
    case "message":
      await processMessage(data);
      break;
    case "message_update":
      console.log('[TikTok Webhook] Message update event, skipping');
      break;
    default:
      console.log('[TikTok Webhook] Unhandled event type:', eventType);
  }
}

/**
 * Process an incoming message event
 */
async function processMessage(data: any) {
  try {
    const message = data.message;
    const senderId = message.sender_id; // TikTok Open ID
    const conversationId = message.conversation_id;
    const messageId = message.message_id;
    const timestamp = message.create_time * 1000; // Convert to milliseconds

    console.log('[TikTok Webhook] Processing message from:', senderId);

    // Extract message content based on type
    let content = "";
    const attachments: any[] = [];

    switch (message.content_type) {
      case "text":
        content = message.content?.text || "";
        break;

      case "image":
        content = "[Image]";
        if (message.content?.image) {
          attachments.push({
            type: "image",
            url: message.content.image.url || message.content.image.uri || "",
            name: message.content.image.name,
          });
        }
        break;

      case "video":
        content = "[Video]";
        if (message.content?.video) {
          attachments.push({
            type: "video",
            url: message.content.video.url || message.content.video.uri || "",
            name: message.content.video.name,
          });
        }
        break;

      case "file":
        content = `[File: ${message.content?.file?.name || "Unknown"}]`;
        if (message.content?.file) {
          attachments.push({
            type: "file",
            url: message.content.file.url || message.content.file.uri || "",
            name: message.content.file.name,
            size: message.content.file.size,
          });
        }
        break;

      case "audio":
        content = "[Audio message]";
        if (message.content?.audio) {
          attachments.push({
            type: "audio",
            url: message.content.audio.url || message.content.audio.uri || "",
          });
        }
        break;

      default:
        content = `[Unsupported message type: ${message.content_type}]`;
        console.log('[TikTok Webhook] Unsupported content type:', message.content_type);
    }

    // Call ReceiveMessageUseCase with NEW interface
    const useCase = await receiveMessageUseCase();
    const result = await useCase.execute({
      channelId: CLIENT_KEY || "tiktok-default", // TikTok Business Account identifier
      senderPlatformId: senderId, // TikTok Open ID
      platform: "tiktok",
      platformMessageId: messageId,
      content,
      attachments: attachments.length > 0 ? attachments : undefined,
      sentAt: new Date(timestamp),
      metadata: {
        conversationId,
        contentType: message.content_type,
      },
    });

    console.log('[TikTok Webhook] Message processed successfully');

    // Broadcast SSE events for real-time UI updates
    try {
      broadcastEvent("new_message", {
        message: result.message,
        platform: "tiktok",
      });

      if (result.isNewConversation) {
        broadcastEvent("new_conversation", {
          conversationId: result.message.conversationId,
          platform: "tiktok",
          channelId: CLIENT_KEY || "tiktok-default",
          senderPlatformId: senderId,
        });
      }
    } catch (sseError: any) {
      console.error('[TikTok Webhook] SSE broadcast error:', sseError);
      // Don't throw - SSE errors shouldn't block webhook processing
    }
  } catch (error: any) {
    console.error('[TikTok Webhook] Error processing message:', error);
    throw error;
  }
}

/**
 * Verify TikTok webhook signature
 * Reference: https://developers.tiktok.com/doc/webhooks-security
 */
function verifySignature(payload: string, signature: string, clientSecret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", clientSecret)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('[TikTok Webhook] Error verifying signature:', error);
    return false;
  }
}
