import type { Platform } from "@/core/domain/messaging/message";
import type { MessagingService, SendMessageResult } from "@/core/application/interfaces/messaging/messaging-adapter";

/**
 * Base class for messaging adapters with common utilities
 */
export abstract class BaseMessagingAdapter implements MessagingService {
  abstract platform: Platform;

  protected log(message: string, data?: any): void {
    const adapterName = this.constructor.name;
    console.log(`[${adapterName}] ${message}`, data || "");
  }

  protected logError(message: string, error: any): void {
    const adapterName = this.constructor.name;
    console.error(`[${adapterName}] ${message}`, {
      error: error.message,
      stack: error.stack,
    });
  }

  protected validateParams(params: Record<string, any>): void {
    for (const [key, value] of Object.entries(params)) {
      if (!value || (typeof value === "string" && value.trim().length === 0)) {
        throw new Error(`${key} is required`);
      }
    }
  }

  abstract sendMessage(platformUserId: string, content: string): Promise<SendMessageResult>;
  abstract getCustomerInfo(platformUserId: string): Promise<{ name: string; avatar: string }>;
}
