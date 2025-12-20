import type { SendMessageResult } from "@/core/application/interfaces/messaging/messaging-adapter";
import { BaseMessagingAdapter } from "./messaging-service";

export class TikTokMessagingAdapter extends BaseMessagingAdapter {
  platform = "tiktok" as const;

  constructor(private token: string) {
    super();
  }

  async getCustomerInfo(platformUserId: string): Promise<{ name: string; avatar: string }> {
    this.validateParams({ platformUserId });

    try {
      this.log("Getting customer info from TikTok", platformUserId);

      // TikTok uses open_id as the user identifier
      const url = `https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        this.logError("TikTok API error", result);
        throw new Error(`TikTok API error: ${result.error?.message || "Unknown error"}`);
      }

      this.log("Customer info retrieved successfully", result.data);

      return {
        name: result.data?.user?.display_name || platformUserId,
        avatar: result.data?.user?.avatar_url || "",
      };
    } catch (error: any) {
      this.logError("Failed to get customer info from TikTok", error);
      throw error;
    }
  }

  async sendMessage(platformUserId: string, content: string): Promise<SendMessageResult> {
    // TODO: Implement TikTok messaging
    throw new Error("TikTok messaging not yet implemented");
  }
}
