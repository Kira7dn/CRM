import type { SendMessageResult } from "@/core/application/interfaces/social/messaging-adapter";
import type { ZaloAuthService } from "../auth/zalo-auth-service";
import { BaseMessagingAdapter } from "./messaging-service";

export class ZaloMessagingAdapter extends BaseMessagingAdapter {
  platform = "zalo" as const;

  constructor(private auth: ZaloAuthService) {
    super();
  }

  async sendMessage(platformUserId: string, content: string): Promise<SendMessageResult> {
    // TODO: Implement Zalo messaging
    throw new Error("Zalo messaging not yet implemented");
  }
}
