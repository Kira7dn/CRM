import type { SendMessageResult } from "@/core/application/interfaces/messaging/messaging-adapter";
import type { ZaloAuthService } from "../auth/zalo-auth-service";
import { BaseMessagingAdapter } from "./messaging-service";

export class ZaloMessagingAdapter extends BaseMessagingAdapter {
  platform = "zalo" as const;

  constructor(private auth: ZaloAuthService) {
    super();
  }

  async getCustomerInfo(platformUserId: string): Promise<{ name: string; avatar: string }> {
    this.validateParams({ platformUserId });

    try {
      this.log("Getting customer info from Zalo", platformUserId);

      const url = `https://openapi.zalo.me/v2.0/oa/getprofile?data={"user_id":"${platformUserId}"}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          access_token: this.auth.getAccessToken(),
        },
      });

      const result = await response.json();

      if (!response.ok || result.error !== 0) {
        this.logError("Zalo API error", result);
        throw new Error(`Zalo API error: ${result.message || "Unknown error"}`);
      }

      this.log("Customer info retrieved successfully", result.data);

      return {
        name: result.data.display_name || result.data.user_id,
        avatar: result.data.avatar || "",
      };
    } catch (error: any) {
      this.logError("Failed to get customer info from Zalo", error);
      throw error;
    }
  }

  async sendMessage(platformUserId: string, content: string): Promise<SendMessageResult> {
    this.validateParams({ platformUserId, content });

    try {
      this.log("Sending message to Zalo user", { platformUserId, content });

      const url = `https://openapi.zalo.me/v2.0/oa/message`;
      const params = new URLSearchParams({
        access_token: this.auth.getAccessToken(),
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: {
            user_id: platformUserId,
          },
          message: {
            text: content,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error !== 0) {
        this.logError("Zalo send message error", result);
        return {
          success: false,
        };
      }

      this.log("Message sent successfully", result.data);

      return {
        success: true,
        platformMessageId: result.data?.message_id || "",
      };
    } catch (error: any) {
      this.logError("Failed to send message to Zalo", error);
      return {
        success: false,
      };
    }
  }
}
