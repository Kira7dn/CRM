import type { MessageService, MessagePayload } from "@/core/application/interfaces/messaging/message-service";
import type { ConversationService } from "@/core/application/interfaces/messaging/conversation-service";
import type { Message, Platform } from "@/core/domain/messaging/message";
import { validateMessage } from "@/core/domain/messaging/message";
import type { MessagingAdapterFactory } from "@/core/application/interfaces/messaging/messaging-adapter";

/**
 * Request payload for sending a message from CRM to platform
 */
export interface SendMessageRequest {
  // Conversation identification
  conversationId: string;

  // Platform and user identification
  platform: Platform;
  platformUserId: string; // The recipient's platform-specific ID

  // Message content
  content: string;
  attachments?: Array<{
    type: "image" | "file" | "video" | "audio";
    url: string;
  }>;
}

/**
 * Response from sending a message
 */
export interface SendMessageResponse {
  message: Message;
  sent: boolean;
}

/**
 * UseCase: Send message from CRM agent to customer on platform
 *
 * Responsibilities:
 * 1. Validate request payload
 * 2. Select correct MessagingGateway for the platform
 * 3. Send message via platform API
 * 4. Save sent message to MessageRepository
 * 5. Update conversation's lastMessageAt timestamp
 * 6. Handle errors gracefully
 */
export class SendMessageUseCase {
  constructor(
    private messageService: MessageService,
    private conversationService: ConversationService,
    private messagingFactory: MessagingAdapterFactory
  ) { }

  async execute(request: SendMessageRequest): Promise<SendMessageResponse> {
    console.log('[SendMessageUseCase] Sending message:', request);

    // Step 1: Validate request
    this.validateRequest(request);

    // Step 2: Verify conversation exists
    const conversation = await this.conversationService.getById(request.conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${request.conversationId}`);
    }

    // Step 3: Verify platform matches conversation
    if (conversation.platform !== request.platform) {
      throw new Error(
        `Platform mismatch: conversation is for ${conversation.platform}, but trying to send to ${request.platform}`
      );
    }

    // Step 4: Get the appropriate messaging adapter
    const integration = await this.messagingFactory.create(request.platform, conversation.channelId);

    // Step 5: Send message via platform API
    let sent = false;
    let platformMessageId: string | undefined;
    let deliveryStatus: "sent" | "failed" | "pending" = "pending";

    try {
      let sendResult;

      if (request.attachments && request.attachments.length > 0) {
        // Send message with attachments
        if (integration.sendMessageWithAttachments) {
          sendResult = await integration.sendMessageWithAttachments(
            request.platformUserId,
            request.content,
            request.attachments
          );
        } else {
          throw new Error(`Platform ${request.platform} does not support sending attachments`);
        }
      } else {
        // Send text-only message
        if (integration.sendMessage) {
          sendResult = await integration.sendMessage(request.platformUserId, request.content);
        } else {
          throw new Error(`Platform ${request.platform} does not support sending messages`);
        }
      }

      // Capture platform message ID and status from send result
      sent = sendResult.success;
      platformMessageId = sendResult.platformMessageId;
      deliveryStatus = sendResult.success ? "sent" : "failed";

      console.log('[SendMessageUseCase] Message sent successfully to platform', { platformMessageId });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[SendMessageUseCase] Failed to send message to platform:', errorMessage);
      // Continue to save the message even if sending fails, but mark it
      sent = false;
      deliveryStatus = "failed";
    }

    // Step 6: Create message payload
    const now = new Date();
    const messagePayload: MessagePayload = {
      conversationId: request.conversationId,
      sender: "agent",
      content: request.content,
      attachments: request.attachments,
      sentAt: now,
      platformMessageId, // Store platform message ID for idempotency
      deliveryStatus, // Track delivery status
      isRead: true, // Agent messages are automatically marked as read
    };

    // Step 7: Validate message data
    const validationErrors = validateMessage(messagePayload);
    if (validationErrors.length > 0) {
      throw new Error(`Message validation failed: ${validationErrors.join(', ')}`);
    }

    // Step 8: Save message to database
    const message = await this.messageService.create(messagePayload);
    console.log('[SendMessageUseCase] Message saved to database:', message.id);

    // Step 9: Update conversation's last message time
    await this.conversationService.updateLastMessageTime(request.conversationId, now);

    // Step 10: If sending failed, throw error after saving
    if (!sent) {
      throw new Error('Message saved locally but failed to send to platform. Please retry.');
    }

    return {
      message,
      sent,
    };
  }

  /**
   * Validate incoming request
   */
  private validateRequest(request: SendMessageRequest): void {
    if (!request.conversationId || request.conversationId.trim().length === 0) {
      throw new Error('Conversation ID is required');
    }

    if (!request.platform) {
      throw new Error('Platform is required');
    }

    if (!request.platformUserId || request.platformUserId.trim().length === 0) {
      throw new Error('Platform user ID is required');
    }

    if (!request.content || request.content.trim().length === 0) {
      if (!request.attachments || request.attachments.length === 0) {
        throw new Error('Message must have either content or attachments');
      }
    }

    // Validate platform is supported
    if (!this.messagingFactory.isSupported(request.platform)) {
      throw new Error(
        `Unsupported platform: ${request.platform}. Supported platforms: ${this.messagingFactory.getSupportedPlatforms().join(', ')}`
      );
    }
  }
}
