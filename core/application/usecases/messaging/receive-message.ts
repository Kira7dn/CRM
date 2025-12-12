import type { MessageService, MessagePayload } from "@/core/application/interfaces/messaging/message-service";
import type { ConversationService } from "@/core/application/interfaces/messaging/conversation-service";
import type { CustomerService } from "@/core/application/interfaces/customers/customer-service";
import type { Message, Platform } from "@/core/domain/messaging/message";
import type { CustomerSource } from "@/core/domain/customers/customer";
import { validateMessage } from "@/core/domain/messaging/message";
import { MessagingAdapterFactory } from "../../interfaces/messaging/messaging-adapter";

/**
 * Request payload for receiving a message from webhook
 */
export interface ReceiveMessageRequest {
  // Channel and platform identification
  channelId: string; // Page ID / Zalo OA ID / TikTok Business Account ID
  platform: Platform;

  // Sender identification
  senderPlatformId: string; // PSID (Facebook), Zalo UID, TikTok UID
  platformMessageId?: string; // For idempotency check

  // Message content
  content?: string;
  attachments?: Array<{
    type: "image" | "file" | "video" | "audio";
    url: string;
    name?: string;
    size?: number;
  }>;

  // Metadata
  sentAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Response from receiving a message
 */
export interface ReceiveMessageResponse {
  message: Message;
  isNewConversation: boolean;
}

/**
 * UseCase: Handle incoming messages from platform webhooks
 *
 * Responsibilities:
 * 1. Validate incoming webhook payload
 * 2. Check for duplicate messages (idempotency via platformMessageId)
 * 3. Find or create conversation for customer + platform
 * 4. Create and save message
 * 5. Update conversation's lastMessageAt timestamp
 */
export class ReceiveMessageUseCase {
  constructor(
    private messageService: MessageService,
    private conversationService: ConversationService,
    private customerService: CustomerService,
    private messagingFactory: MessagingAdapterFactory
  ) { }

  async execute(request: ReceiveMessageRequest): Promise<ReceiveMessageResponse> {
    console.log('[ReceiveMessageUseCase] Processing incoming message:', request);

    // Step 1: Validate request
    this.validateRequest(request);

    // Step 2: Check for duplicate message (idempotency)
    if (request.platformMessageId) {
      const existingMessage = await this.messageService.getByPlatformMessageId(
        request.platformMessageId
      );
      if (existingMessage) {
        console.log('[ReceiveMessageUseCase] Duplicate message detected, skipping:', request.platformMessageId);
        return {
          message: existingMessage,
          isNewConversation: false,
        };
      }
    }


    // Step 3: Find or create customer from platform ID
    const { customer, isNew: isNewCustomer } = await this.findOrCreateCustomer(
      request.channelId,
      request.senderPlatformId,
      request.platform
    );

    console.log('[ReceiveMessageUseCase] Customer:', customer.id, 'isNew:', isNewCustomer);

    // Step 4: Find or create conversation
    const { conversation, isNew } = await this.findOrCreateConversation(
      request.channelId,
      request.senderPlatformId,
      request.platform,
      customer.id
    );

    console.log('[ReceiveMessageUseCase] Using conversation:', conversation.id, 'isNew:', isNew);

    // Step 4: Create message payload
    const messagePayload: MessagePayload = {
      conversationId: conversation.id,
      sender: "customer",
      platformMessageId: request.platformMessageId,
      content: request.content || "",
      attachments: request.attachments,
      sentAt: request.sentAt || new Date(),
      isRead: false,
    };

    // Step 5: Validate message data
    const validationErrors = validateMessage(messagePayload);
    if (validationErrors.length > 0) {
      throw new Error(`Message validation failed: ${validationErrors.join(', ')}`);
    }

    // Step 6: Save message
    const message = await this.messageService.create(messagePayload);
    console.log('[ReceiveMessageUseCase] Message saved:', message.id);

    // Step 7: Update conversation's last message time
    await this.conversationService.updateLastMessageTime(conversation.id, message.sentAt);

    return {
      message,
      isNewConversation: isNew,
    };
  }

  /**
   * Validate incoming request
   */
  private validateRequest(request: ReceiveMessageRequest): void {
    if (!request.channelId || request.channelId.trim().length === 0) {
      throw new Error('channelId is required');
    }

    if (!request.senderPlatformId || request.senderPlatformId.trim().length === 0) {
      throw new Error('senderPlatformId is required');
    }

    if (!request.platform) {
      throw new Error('platform is required');
    }

    const validPlatforms: Platform[] = ["facebook", "zalo", "tiktok", "website"];
    if (!validPlatforms.includes(request.platform)) {
      throw new Error(`Invalid platform. Must be one of: ${validPlatforms.join(", ")}`);
    }

    if (!request.content && (!request.attachments || request.attachments.length === 0)) {
      throw new Error('Message must have content or attachments');
    }
  }

  /**
   * Find existing customer or create new one
   * Uses channelId + senderPlatformId for accurate mapping
   */
  private async findOrCreateCustomer(
    channelId: string,
    senderPlatformId: string,
    platform: Platform
  ): Promise<{ customer: any; isNew: boolean }> {
    // Try to find existing customer using channelId + senderPlatformId
    let customer = await this.customerService.findByPlatformId(
      platform,
      senderPlatformId
    );

    if (customer) {
      return { customer, isNew: false };
    }

    // Step 4: Get the appropriate messaging adapter
    const integration = await this.messagingFactory.create(platform, channelId);
    const customerInfo = await integration.getCustomerInfo(senderPlatformId);
    // Create new customer
    const now = new Date();
    customer = await this.customerService.create({
      platformIds: [{ platform, platformUserId: senderPlatformId }],
      createdAt: now,
      name: customerInfo.name,
      avatar: customerInfo.avatar,
    });

    console.log('[ReceiveMessageUseCase] Created new customer:', customer.id);
    return { customer, isNew: true };
  }

  /**
   * Find existing conversation or create new one
   * Uses channelId + senderPlatformId for accurate mapping
   */
  private async findOrCreateConversation(
    channelId: string,
    senderPlatformId: string,
    platform: Platform,
    customerId: string
  ): Promise<{ conversation: any; isNew: boolean }> {
    // Try to find existing active conversation using channelId + senderPlatformId
    let conversation = await this.conversationService.findOpenByChannelAndCustomer(
      channelId,
      senderPlatformId
    );

    if (conversation) {
      // Update contactId if not set (for backward compatibility with old conversations)
      if (!conversation.contactId && customerId) {
        await this.conversationService.update({
          id: conversation.id,
          contactId: customerId,
        });
        conversation.contactId = customerId;
        console.log('[ReceiveMessageUseCase] Updated conversation with contactId:', customerId);
      }

      // Reopen conversation if it was closed
      if (conversation.status === "closed") {
        await this.conversationService.updateStatus(conversation.id, "open");
        conversation.status = "open";
      }
      return { conversation, isNew: false };
    }

    // Create new conversation
    const now = new Date();
    conversation = await this.conversationService.create({
      channelId,
      customerId: senderPlatformId, // DEPRECATED: Kept for backward compatibility
      contactId: customerId, // NEW: Link to actual Customer entity
      platform,
      status: "open",
      lastMessageAt: now,
      lastIncomingMessageAt: now,
      createdAt: now,
    });

    console.log('[ReceiveMessageUseCase] Created new conversation:', conversation.id);
    return { conversation, isNew: true };
  }
}
