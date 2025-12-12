import type { Message } from "@/core/domain/messaging/message";
import type { SendMessageResult } from "@/core/application/interfaces/messaging/messaging-adapter";
import type { FacebookAuthService } from "../auth/facebook-auth-service";
import { BaseMessagingAdapter } from "./messaging-service";

/**
 * Facebook Messaging Adapter
 * Handles sending messages via Facebook Messenger Platform
 */
export class FacebookMessagingAdapter extends BaseMessagingAdapter {
  platform = "facebook" as const;
  private baseUrl = "https://graph.facebook.com/v19.0";

  constructor(private auth: FacebookAuthService) {
    super();
  }

  async getCustomerInfo(platformUserId: string): Promise<{ name: string; avatar: string }> {
    this.validateParams({ platformUserId });

    try {
      this.log("Getting customer info from Facebook Messenger", platformUserId);

      const url = `${this.baseUrl}/${platformUserId}?access_token=${this.auth.getAccessToken()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        this.logError("Facebook Messenger API error", data);
        throw new Error(
          `Facebook Messenger API error: ${data.error?.message || "Unknown error"}`
        );
      }

      this.log("Customer info retrieved successfully", data);

      // Facebook returns message_id in the response
      return {
        name: `${data.first_name} ${data.last_name}`,
        avatar: data.profile_pic,
      };
    } catch (error: any) {
      this.logError("Failed to get customer info from Facebook", error);
      throw error;
    }
  }

  async sendMessage(platformUserId: string, content: string): Promise<SendMessageResult> {
    this.validateParams({ platformUserId, content });

    const payload = {
      recipient: {
        id: platformUserId,
      },
      message: {
        text: content,
      },
    };

    return await this.sendToMessenger(payload);
  }

  async sendMessageWithAttachments(
    platformUserId: string,
    content: string,
    attachments: Array<{
      type: "image" | "file" | "video" | "audio";
      url: string;
    }>
  ): Promise<SendMessageResult> {
    this.validateParams({ platformUserId });

    let lastResult: SendMessageResult = { success: false };

    // Send text first if provided
    if (content && content.trim().length > 0) {
      lastResult = await this.sendMessage(platformUserId, content);
    }

    // Send each attachment separately
    for (const attachment of attachments) {
      const payload = {
        recipient: {
          id: platformUserId,
        },
        message: {
          attachment: {
            type: this.mapAttachmentType(attachment.type),
            payload: {
              url: attachment.url,
              is_reusable: true,
            },
          },
        },
      };

      lastResult = await this.sendToMessenger(payload);
    }

    return lastResult;
  }

  async fetchHistory(platformUserId: string, limit: number = 50): Promise<Message[]> {
    this.log("fetchHistory not supported by Facebook Messenger Platform", {
      platformUserId,
      limit,
    });
    throw new Error(
      "fetchHistory is not supported by Facebook Messenger Platform. Messages should be stored via webhooks."
    );
  }

  async sendTypingIndicator(platformUserId: string, typing: boolean): Promise<void> {
    this.validateParams({ platformUserId });

    const payload = {
      recipient: {
        id: platformUserId,
      },
      sender_action: typing ? "typing_on" : "typing_off",
    };

    await this.sendToMessenger(payload);
  }

  async markAsRead(platformUserId: string): Promise<void> {
    this.validateParams({ platformUserId });

    const payload = {
      recipient: {
        id: platformUserId,
      },
      sender_action: "mark_seen",
    };

    await this.sendToMessenger(payload);
  }



  private async sendToMessenger(payload: any): Promise<SendMessageResult> {
    try {
      this.log("Sending message to Facebook Messenger", payload);

      const url = `${this.baseUrl}/me/messages?access_token=${this.auth.getAccessToken()}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logError("Facebook Messenger API error", data);
        throw new Error(
          `Facebook Messenger API error: ${data.error?.message || "Unknown error"}`
        );
      }

      this.log("Message sent successfully", data);

      // Facebook returns message_id in the response
      return {
        platformMessageId: data.message_id || undefined,
        success: true,
      };
    } catch (error: any) {
      this.logError("Failed to send message to Facebook Messenger", error);
      throw error;
    }
  }

  private mapAttachmentType(type: string): string {
    switch (type) {
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
}
