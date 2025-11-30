import { NextRequest, NextResponse } from "next/server";
import { receiveMessageUseCase } from "@/app/api/messaging/depends";
import crypto from "crypto";

/**
 * Facebook Messenger Platform Webhook
 *
 * Handles:
 * - GET: Webhook verification (Facebook sends this during setup)
 * - POST: Incoming messages and events from Facebook Messenger
 *
 * Reference: https://developers.facebook.com/docs/messenger-platform/webhooks
 */

const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || "your_verify_token_here";
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;

/**
 * GET: Webhook Verification
 * Facebook sends a verification request when you set up the webhook
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    console.log('[Facebook Webhook] Verification request:', { mode, token, challenge });

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log('[Facebook Webhook] Webhook verified successfully');
      return new NextResponse(challenge, { status: 200 });
    }

    console.error('[Facebook Webhook] Verification failed: Invalid token');
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 403 }
    );
  } catch (error: any) {
    console.error('[Facebook Webhook] Verification error:', error);
    return NextResponse.json(
      { error: "Verification error" },
      { status: 500 }
    );
  }
}

/**
 * POST: Receive Messages and Events
 * Facebook sends message events to this endpoint
 *
 * IMPORTANT: Facebook requires response within 200ms, so we use fire-and-forget pattern
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    // Verify webhook signature for security
    if (APP_SECRET && signature) {
      const isValid = verifySignature(body, signature, APP_SECRET);
      if (!isValid) {
        console.error('[Facebook Webhook] Invalid signature');
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 403 }
        );
      }
    }

    const data = JSON.parse(body);
    console.log('[Facebook Webhook] Received payload:', JSON.stringify(data, null, 2));

    // Facebook sends an "object" field to indicate the type of webhook
    if (data.object !== "page") {
      console.log('[Facebook Webhook] Not a page webhook, ignoring');
      return NextResponse.json({ status: "ok" });
    }

    // Fire-and-forget: Process asynchronously and respond immediately
    // This ensures Facebook gets response within 200ms
    setImmediate(async () => {
      try {
        const promises = data.entry.map((entry: any) => processEntry(entry));
        await Promise.all(promises);
        console.log('[Facebook Webhook] All events processed successfully');
      } catch (error: any) {
        console.error('[Facebook Webhook] Async processing error:', error);
        // Error is logged but doesn't affect the response (already sent)
      }
    });

    // Respond immediately to Facebook
    return NextResponse.json({ status: "received" }, { status: 200 });
  } catch (error: any) {
    console.error('[Facebook Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: "Webhook processing error" },
      { status: 500 }
    );
  }
}

/**
 * Process a single entry from the Facebook webhook payload
 */
async function processEntry(entry: any) {
  const messaging = entry.messaging || [];

  for (const event of messaging) {
    if (event.message) {
      await processMessage(event);
    } else if (event.delivery) {
      await processDelivery(event);
    } else if (event.read) {
      await processRead(event);
    } else if (event.postback) {
      await processPostback(event);
    } else {
      console.log('[Facebook Webhook] Unsupported event type:', Object.keys(event));
    }
  }
}

/**
 * Process an incoming message event
 */
async function processMessage(event: any) {
  try {
    const senderId = event.sender.id; // Facebook User SCOPED ID (PSID)
    const recipientId = event.recipient.id; // Page ID
    const timestamp = event.timestamp;
    const message = event.message;

    console.log('[Facebook Webhook] Processing message from:', senderId);

    // Skip if message has no text and no attachments
    if (!message.text && (!message.attachments || message.attachments.length === 0)) {
      console.log('[Facebook Webhook] Empty message, skipping');
      return;
    }

    // Map Facebook attachments to our domain model
    const attachments = message.attachments?.map((att: any) => ({
      type: mapAttachmentType(att.type),
      url: att.payload?.url || "",
      name: att.payload?.title || att.type,
    })) || [];

    // Call ReceiveMessageUseCase with NEW interface
    const useCase = await receiveMessageUseCase();
    await useCase.execute({
      channelId: recipientId, // NEW: Page ID as channelId
      senderPlatformId: senderId, // NEW: PSID as senderPlatformId
      platform: "facebook",
      platformMessageId: message.mid, // Facebook Message ID for idempotency
      content: message.text || "",
      attachments,
      sentAt: new Date(timestamp),
      metadata: {
        messageType: message.attachments?.length ? "attachment" : "text",
      },
    });

    console.log('[Facebook Webhook] Message processed successfully');
  } catch (error: any) {
    console.error('[Facebook Webhook] Error processing message:', error);
    throw error;
  }
}

/**
 * Process delivery receipt event
 */
async function processDelivery(event: any) {
  try {
    const { delivery } = event;
    const mids = delivery.mids || [];
    const watermark = delivery.watermark;

    console.log('[Facebook Webhook] Delivery receipt for messages:', mids);

    // TODO: Implement message status update
    // const useCase = await updateMessageStatusUseCase();
    // for (const messageId of mids) {
    //   await useCase.execute({
    //     platformMessageId: messageId,
    //     status: "delivered",
    //     deliveredAt: new Date(watermark),
    //   });
    // }
  } catch (error: any) {
    console.error('[Facebook Webhook] Error processing delivery:', error);
  }
}

/**
 * Process read receipt event
 */
async function processRead(event: any) {
  try {
    const { read } = event;
    const watermark = read.watermark;

    console.log('[Facebook Webhook] Read receipt up to:', watermark);

    // TODO: Implement conversation read status update
    // const useCase = await markConversationAsReadUseCase();
    // await useCase.execute({
    //   senderPlatformId: event.sender.id,
    //   readAt: new Date(watermark),
    // });
  } catch (error: any) {
    console.error('[Facebook Webhook] Error processing read receipt:', error);
  }
}

/**
 * Process postback event (button clicks, quick replies)
 */
async function processPostback(event: any) {
  try {
    const { postback, sender, recipient, timestamp } = event;
    const senderId = sender.id;
    const recipientId = recipient.id;

    console.log('[Facebook Webhook] Postback received:', postback);

    // Treat postback as a message
    const useCase = await receiveMessageUseCase();
    await useCase.execute({
      channelId: recipientId,
      senderPlatformId: senderId,
      platform: "facebook",
      platformMessageId: postback.mid || `postback-${Date.now()}`,
      content: postback.title || postback.payload,
      sentAt: new Date(timestamp),
      metadata: {
        messageType: "postback",
        payload: postback.payload,
      },
    });

    console.log('[Facebook Webhook] Postback processed successfully');
  } catch (error: any) {
    console.error('[Facebook Webhook] Error processing postback:', error);
  }
}

/**
 * Map Facebook attachment types to our domain model
 */
function mapAttachmentType(fbType: string): "image" | "file" | "video" | "audio" {
  switch (fbType) {
    case "image":
      return "image";
    case "video":
      return "video";
    case "audio":
      return "audio";
    case "file":
    default:
      return "file";
  }
}

/**
 * Verify Facebook webhook signature
 * Reference: https://developers.facebook.com/docs/messenger-platform/webhooks#security
 */
function verifySignature(payload: string, signature: string, appSecret: string): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", appSecret)
    .update(payload)
    .digest("hex");

  const signatureHash = signature.split("=")[1]; // Remove "sha256=" prefix
  return crypto.timingSafeEqual(
    Buffer.from(signatureHash),
    Buffer.from(expectedSignature)
  );
}
