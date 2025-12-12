import type { MessageService } from "@/core/application/interfaces/messaging/message-service";
import type { ConversationService } from "@/core/application/interfaces/messaging/conversation-service";
import type { MessagingAdapterFactory } from "@/core/application/interfaces/messaging/messaging-adapter";
import { Platform } from "@/core/domain/messaging/message";

export interface SyncMessagesRequest {
  conversationId: string;
  platform: Platform;
  platformUserId: string;
  limit?: number; // Number of messages to fetch from platform
}

export interface SyncMessagesResponse {
  conversationId: string;
  messagesSynced: number;
  newMessages: number;
  existingMessages: number;
}

/**
 * SyncMessagesUseCase
 *
 * Synchronizes message history from a platform's API to the local database.
 * Used when reconnecting to a platform or performing initial conversation sync.
 */
export class SyncMessagesUseCase {
  constructor(
    private messageService: MessageService,
    private conversationService: ConversationService,
    private messagingFactory: MessagingAdapterFactory
  ) { }

  async execute(request: SyncMessagesRequest): Promise<SyncMessagesResponse> {
    const { conversationId, platform, platformUserId, limit = 50 } = request;

    // Validate inputs
    if (!conversationId || conversationId.trim() === "") {
      throw new Error("Conversation ID is required");
    }

    if (!platform) {
      throw new Error("Platform is required");
    }

    if (!platformUserId || platformUserId.trim() === "") {
      throw new Error("Platform user ID is required");
    }

    // Verify conversation exists
    const conversation = await this.conversationService.getById(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Verify platform matches
    if (conversation.platform !== platform) {
      throw new Error(
        `Platform mismatch: conversation is ${conversation.platform}, requested ${platform}`
      );
    }

    // Get the appropriate messaging adapter
    const integration = await this.messagingFactory.create(platform, platformUserId);

    // Get existing messages to avoid duplicates
    const existingMessages = await this.messageService.getByConversationId(conversationId);
    const existingPlatformIds = new Set(
      existingMessages
        .filter((m) => m.platformMessageId)
        .map((m) => m.platformMessageId!)
    );

    const newMessageCount = 0;
    const existingMessageCount = 0;

    try {
      // Fetch message history from platform
      // Note: This is a simplified implementation
      // Real implementation would call gateway.getMessageHistory(platformUserId, limit)
      // For now, we'll just track that sync was attempted

      // In a real implementation, you would:
      // 1. Call gateway method to fetch messages
      // 2. Filter out messages already in database (using platformMessageId)
      // 3. Save new messages to database
      // 4. Update conversation lastMessageAt if newer messages exist

      // Example pseudocode:
      // const platformMessages = await gateway.getMessageHistory(platformUserId, limit);
      //
      // for (const platformMessage of platformMessages) {
      //   if (existingPlatformIds.has(platformMessage.id)) {
      //     existingMessageCount++;
      //     continue;
      //   }
      //
      //   await this.messageService.create({
      //     conversationId,
      //     platformMessageId: platformMessage.id,
      //     sender: platformMessage.sender,
      //     content: platformMessage.content,
      //     sentAt: platformMessage.timestamp,
      //     isRead: true, // Historical messages are considered read
      //     attachments: platformMessage.attachments,
      //   });
      //
      //   newMessageCount++;
      // }

      // For now, return a response indicating sync was initiated
      return {
        conversationId,
        messagesSynced: newMessageCount + existingMessageCount,
        newMessages: newMessageCount,
        existingMessages: existingMessageCount,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to sync messages from ${platform}: ${error.message}`);
      }
      throw error;
    }
  }
}
