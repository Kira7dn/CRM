import type { Platform } from "@/core/domain/campaigns/post";
import type { Message } from "@/core/domain/messaging/message";
import type {
  PlatformIntegrationService,
  PlatformPublishRequest,
  PlatformPublishResponse
} from "@/core/application/interfaces/platform-integration-service";

/**
 * Unified Social Integration Interface
 *
 * Combines both posting and messaging capabilities for social platforms.
 * Each platform integration should implement this interface to support
 * both content publishing and customer messaging.
 */
export interface SocialIntegration extends PlatformIntegrationService {
  platform: Platform;

  // ========== Post Publishing (from PlatformIntegrationService) ==========
  publish(request: PlatformPublishRequest): Promise<PlatformPublishResponse>;
  update(postId: string, request: PlatformPublishRequest): Promise<PlatformPublishResponse>;
  delete(postId: string): Promise<boolean>;
  getMetrics(postId: string): Promise<any>;
  verifyAuth(): Promise<boolean>;

  // ========== Messaging Capabilities ==========

  /**
   * Send a text message to a user on the platform
   * Optional - only platforms with messaging support need to implement this
   *
   * @param platformUserId - The platform-specific user ID (PSID, Zalo User ID, TikTok Open ID)
   * @param content - The message text to send
   * @returns Promise that resolves when message is sent
   */
  sendMessage?(platformUserId: string, content: string): Promise<void>;

  /**
   * Send a message with attachments to a user on the platform
   *
   * @param platformUserId - The platform-specific user ID
   * @param content - The message text (can be empty for media-only messages)
   * @param attachments - Array of attachment objects
   * @returns Promise that resolves when message is sent
   */
  sendMessageWithAttachments?(
    platformUserId: string,
    content: string,
    attachments: Array<{
      type: "image" | "file" | "video" | "audio";
      url: string;
    }>
  ): Promise<void>;

  /**
   * Fetch message history for a user (optional, platform-dependent)
   *
   * @param platformUserId - The platform-specific user ID
   * @param limit - Maximum number of messages to fetch
   * @returns Promise that resolves with array of messages
   */
  fetchHistory?(platformUserId: string, limit?: number): Promise<Message[]>;

  /**
   * Send typing indicator to user (optional)
   *
   * @param platformUserId - The platform-specific user ID
   * @param typing - true to show typing, false to hide
   */
  sendTypingIndicator?(platformUserId: string, typing: boolean): Promise<void>;

  /**
   * Mark message as read (optional)
   *
   * @param platformUserId - The platform-specific user ID
   */
  markAsRead?(platformUserId: string): Promise<void>;
}

/**
 * Base class for Social Integration implementations
 * Provides common functionality and error handling
 */
export abstract class BaseSocialIntegration implements SocialIntegration {
  abstract platform: Platform;

  // Abstract methods that must be implemented
  abstract publish(request: PlatformPublishRequest): Promise<PlatformPublishResponse>;
  abstract update(postId: string, request: PlatformPublishRequest): Promise<PlatformPublishResponse>;
  abstract delete(postId: string): Promise<boolean>;
  abstract getMetrics(postId: string): Promise<any>;
  abstract verifyAuth(): Promise<boolean>;

  /**
   * Log integration activity
   */
  protected log(message: string, data?: any): void {
    const integrationName = this.constructor.name;
    console.log(`[${integrationName}] ${message}`, data || "");
  }

  /**
   * Log integration errors
   */
  protected logError(message: string, error: any): void {
    const integrationName = this.constructor.name;
    console.error(`[${integrationName}] ${message}`, {
      error: error.message,
      stack: error.stack,
    });
  }

  /**
   * Validate required parameters
   */
  protected validateParams(params: Record<string, any>): void {
    for (const [key, value] of Object.entries(params)) {
      if (!value || (typeof value === "string" && value.trim().length === 0)) {
        throw new Error(`${key} is required`);
      }
    }
  }

  /**
   * Format message for platform
   */
  protected formatMessage(request: PlatformPublishRequest): string {
    let message = "";

    if (request.title) {
      message += request.title;
    }

    if (request.body) {
      message += (message ? "\n\n" : "") + request.body;
    }

    if (request.hashtags && request.hashtags.length > 0) {
      message += (message ? "\n\n" : "") + request.hashtags.map(tag =>
        tag.startsWith('#') ? tag : `#${tag}`
      ).join(' ');
    }

    return message;
  }
}
