import type { SendMessageResult } from "@/core/application/interfaces/social/messaging-adapter";
import type { TikTokAuthService } from "../auth/tiktok-auth-service";
import { BaseMessagingAdapter } from "./messaging-service";

export class TikTokMessagingAdapter extends BaseMessagingAdapter {
  platform = "tiktok" as const;

  constructor(private auth: TikTokAuthService) {
    super();
  }

  async sendMessage(platformUserId: string, content: string): Promise<SendMessageResult> {
    // TODO: Implement TikTok messaging
    throw new Error("TikTok messaging not yet implemented");
  }
}
