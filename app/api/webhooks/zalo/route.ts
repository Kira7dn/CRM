import { NextRequest, NextResponse } from "next/server";
import { receiveMessageUseCase } from "@/app/api/messaging/depends";
import { broadcastEvent } from "@/app/api/events/stream";
import crypto from "crypto";

/**
 * Zalo Official Account (OA) Webhook
 *
 * Handles incoming messages and events from Zalo OA
 *
 * Reference: https://developers.zalo.me/docs/official-account/webhook/
 */

const APP_SECRET = process.env.ZALO_APP_SECRET || "";

/**
 * POST: Receive Messages and Events from Zalo
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-zevent-signature");

    // Verify webhook signature for security
    if (APP_SECRET && signature) {
      const isValid = verifySignature(body, signature, APP_SECRET);
      if (!isValid) {
        console.error('[Zalo Webhook] Invalid signature');
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 403 }
        );
      }
    }

    const data = JSON.parse(body);
    console.log('[Zalo Webhook] Received payload:', JSON.stringify(data, null, 2));

    // Process the event
    await processEvent(data);

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error('[Zalo Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: "Webhook processing error", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Process a Zalo webhook event
 */
async function processEvent(data: any) {
  const eventName = data.event_name;

  console.log('[Zalo Webhook] Processing event:', eventName);

  switch (eventName) {
    case "user_send_text":
      await processTextMessage(data);
      break;
    case "user_send_image":
      await processImageMessage(data);
      break;
    case "user_send_file":
      await processFileMessage(data);
      break;
    case "user_send_audio":
      await processAudioMessage(data);
      break;
    case "user_send_video":
      await processVideoMessage(data);
      break;
    // TODO: Handle other event types
    // - user_send_sticker
    // - user_send_link
    // - user_send_business_card
    // - user_send_location
    // - oa_send_consent_result
    default:
      console.log('[Zalo Webhook] Unhandled event type:', eventName);
  }
}

/**
 * Process text message from user
 */
async function processTextMessage(data: any) {
  try {
    const senderId = data.sender.id; // Zalo User ID
    const timestamp = data.timestamp;
    const message = data.message;

    console.log('[Zalo Webhook] Processing text message from:', senderId);

    const useCase = await receiveMessageUseCase();
    const result = await useCase.execute({
      channelId: process.env.ZALO_OA_ID || "zalo-default",
      senderPlatformId: senderId,
      platform: "zalo",
      platformMessageId: data.msg_id,
      content: message.text,
      sentAt: new Date(timestamp),
    });

    console.log('[Zalo Webhook] Text message processed successfully');

    // Broadcast SSE events for real-time UI updates
    try {
      broadcastEvent("new_message", {
        message: result.message,
        platform: "zalo",
      });

      if (result.isNewConversation) {
        broadcastEvent("new_conversation", {
          conversationId: result.message.conversationId,
          platform: "zalo",
          channelId: process.env.ZALO_OA_ID || "zalo-default",
          senderPlatformId: senderId,
        });
      }
    } catch (sseError: any) {
      console.error('[Zalo Webhook] SSE broadcast error:', sseError);
    }
  } catch (error: any) {
    console.error('[Zalo Webhook] Error processing text message:', error);
    throw error;
  }
}

/**
 * Process image message from user
 */
async function processImageMessage(data: any) {
  try {
    const senderId = data.sender.id;
    const timestamp = data.timestamp;
    const message = data.message;

    console.log('[Zalo Webhook] Processing image message from:', senderId);

    const useCase = await receiveMessageUseCase();
    const result = await useCase.execute({
      channelId: process.env.ZALO_OA_ID || "zalo-default",
      senderPlatformId: senderId,
      platform: "zalo",
      platformMessageId: data.msg_id,
      content: "[Image]",
      attachments: [
        {
          type: "image",
          url: message.url || message.thumbnail || "",
        },
      ],
      sentAt: new Date(timestamp),
    });

    console.log('[Zalo Webhook] Image message processed successfully');

    // Broadcast SSE events
    try {
      broadcastEvent("new_message", {
        message: result.message,
        platform: "zalo",
      });

      if (result.isNewConversation) {
        broadcastEvent("new_conversation", {
          conversationId: result.message.conversationId,
          platform: "zalo",
          channelId: process.env.ZALO_OA_ID || "zalo-default",
          senderPlatformId: senderId,
        });
      }
    } catch (sseError: any) {
      console.error('[Zalo Webhook] SSE broadcast error:', sseError);
    }
  } catch (error: any) {
    console.error('[Zalo Webhook] Error processing image message:', error);
    throw error;
  }
}

/**
 * Process file message from user
 */
async function processFileMessage(data: any) {
  try {
    const senderId = data.sender.id;
    const timestamp = data.timestamp;
    const message = data.message;

    console.log('[Zalo Webhook] Processing file message from:', senderId);

    const useCase = await receiveMessageUseCase();
    const result = await useCase.execute({
      channelId: process.env.ZALO_OA_ID || "zalo-default",
      senderPlatformId: senderId,
      platform: "zalo",
      platformMessageId: data.msg_id,
      content: `[File: ${message.name || "Unknown"}]`,
      attachments: [
        {
          type: "file",
          url: message.url || "",
          name: message.name,
          size: message.size,
        },
      ],
      sentAt: new Date(timestamp),
    });

    console.log('[Zalo Webhook] File message processed successfully');

    // Broadcast SSE events
    try {
      broadcastEvent("new_message", {
        message: result.message,
        platform: "zalo",
      });

      if (result.isNewConversation) {
        broadcastEvent("new_conversation", {
          conversationId: result.message.conversationId,
          platform: "zalo",
          channelId: process.env.ZALO_OA_ID || "zalo-default",
          senderPlatformId: senderId,
        });
      }
    } catch (sseError: any) {
      console.error('[Zalo Webhook] SSE broadcast error:', sseError);
    }
  } catch (error: any) {
    console.error('[Zalo Webhook] Error processing file message:', error);
    throw error;
  }
}

/**
 * Process audio message from user
 */
async function processAudioMessage(data: any) {
  try {
    const senderId = data.sender.id;
    const timestamp = data.timestamp;
    const message = data.message;

    console.log('[Zalo Webhook] Processing audio message from:', senderId);

    const useCase = await receiveMessageUseCase();
    const result = await useCase.execute({
      channelId: process.env.ZALO_OA_ID || "zalo-default",
      senderPlatformId: senderId,
      platform: "zalo",
      platformMessageId: data.msg_id,
      content: "[Audio message]",
      attachments: [
        {
          type: "audio",
          url: message.url || "",
        },
      ],
      sentAt: new Date(timestamp),
    });

    console.log('[Zalo Webhook] Audio message processed successfully');

    // Broadcast SSE events
    try {
      broadcastEvent("new_message", {
        message: result.message,
        platform: "zalo",
      });

      if (result.isNewConversation) {
        broadcastEvent("new_conversation", {
          conversationId: result.message.conversationId,
          platform: "zalo",
          channelId: process.env.ZALO_OA_ID || "zalo-default",
          senderPlatformId: senderId,
        });
      }
    } catch (sseError: any) {
      console.error('[Zalo Webhook] SSE broadcast error:', sseError);
    }
  } catch (error: any) {
    console.error('[Zalo Webhook] Error processing audio message:', error);
    throw error;
  }
}

/**
 * Process video message from user
 */
async function processVideoMessage(data: any) {
  try {
    const senderId = data.sender.id;
    const timestamp = data.timestamp;
    const message = data.message;

    console.log('[Zalo Webhook] Processing video message from:', senderId);

    const useCase = await receiveMessageUseCase();
    const result = await useCase.execute({
      channelId: process.env.ZALO_OA_ID || "zalo-default",
      senderPlatformId: senderId,
      platform: "zalo",
      platformMessageId: data.msg_id,
      content: "[Video]",
      attachments: [
        {
          type: "video",
          url: message.url || message.thumbnail || "",
        },
      ],
      sentAt: new Date(timestamp),
    });

    console.log('[Zalo Webhook] Video message processed successfully');

    // Broadcast SSE events
    try {
      broadcastEvent("new_message", {
        message: result.message,
        platform: "zalo",
      });

      if (result.isNewConversation) {
        broadcastEvent("new_conversation", {
          conversationId: result.message.conversationId,
          platform: "zalo",
          channelId: process.env.ZALO_OA_ID || "zalo-default",
          senderPlatformId: senderId,
        });
      }
    } catch (sseError: any) {
      console.error('[Zalo Webhook] SSE broadcast error:', sseError);
    }
  } catch (error: any) {
    console.error('[Zalo Webhook] Error processing video message:', error);
    throw error;
  }
}

/**
 * Verify Zalo webhook signature
 * Reference: https://developers.zalo.me/docs/official-account/webhook/xac-thuc-webhook-post-2178
 */
function verifySignature(payload: string, signature: string, appSecret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", appSecret)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('[Zalo Webhook] Error verifying signature:', error);
    return false;
  }
}
