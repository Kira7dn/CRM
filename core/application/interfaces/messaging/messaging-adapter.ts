import type { Message, Platform } from "@/core/domain/messaging/message";

/**
 * Result of sending a message to a platform
 */
export interface SendMessageResult {
  platformMessageId?: string; // External platform message ID (for tracking)
  success: boolean; // Whether the message was sent successfully
}

/**
 * Messaging Service Interface
 * Defines contract for sending messages to customers on social platforms
 */
export interface MessagingService {
  platform: Platform;
  /**
   * Get customer info
   */
  getCustomerInfo(platformUserId: string): Promise<{ name: string; avatar: string }>;

  /**
   * Send a text message to a user on the platform
   * @returns SendMessageResult with platformMessageId and success status
   */
  sendMessage(platformUserId: string, content: string): Promise<SendMessageResult>;

  /**
   * Send a message with attachments to a user
   * @returns SendMessageResult with platformMessageId and success status
   */
  sendMessageWithAttachments?(
    platformUserId: string,
    content: string,
    attachments: Array<{
      type: "image" | "file" | "video" | "audio";
      url: string;
    }>
  ): Promise<SendMessageResult>;

  /**
   * Fetch message history for a user (optional, platform-dependent)
   */
  fetchHistory?(platformUserId: string, limit?: number): Promise<Message[]>;

  /**
   * Send typing indicator to user (optional)
   */
  sendTypingIndicator?(platformUserId: string, typing: boolean): Promise<void>;

  /**
   * Mark message as read (optional)
   */
  markAsRead?(platformUserId: string): Promise<void>;

}

/**
 * Messaging Adapter Factory Interface
 * Creates messaging adapters for different platforms
 */
export interface MessagingAdapterFactory {
  create(platform: Platform, channelId: string): Promise<MessagingService>;
  clearCache(): void;
  getSupportedPlatforms(): Platform[];
  isSupported(platform: Platform): boolean;
}
