import { BasePlatformAuthService } from "./platform-auth-service";
import type { PlatformAuthConfig } from "@/core/application/interfaces/social/auth-service";

export interface ZaloAuthConfig extends PlatformAuthConfig {}

export class ZaloAuthService extends BasePlatformAuthService {
  protected baseUrl = "https://openapi.zaloapp.com/oa/v2";

  constructor(config: ZaloAuthConfig) {
    super(config);
  }

  async verifyAuth(): Promise<boolean> {
    // TODO: Implement Zalo auth verification
    return true;
  }
}

export async function createZaloAuthService(): Promise<ZaloAuthService> {
  // Zalo uses webhook-based token (no userId required)
  const webhookUrl = "https://n8n.linkstrategy.io.vn/webhook/zalo_access_token";

  try {
    const response = await fetch(webhookUrl);
    const data = await response.json();

    if (!data.access_token) {
      throw new Error("Failed to fetch Zalo access token from webhook");
    }

    const config: ZaloAuthConfig = {
      accessToken: data.access_token,
    };

    return new ZaloAuthService(config);
  } catch (error) {
    throw new Error(`Failed to create Zalo auth service: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
