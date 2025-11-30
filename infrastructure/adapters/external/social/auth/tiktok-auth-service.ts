import { BasePlatformAuthService } from "./platform-auth-service";
import type { PlatformAuthConfig } from "@/core/application/interfaces/social/auth-service";

export interface TikTokAuthConfig extends PlatformAuthConfig {
  clientKey: string;
  clientSecret: string;
}

export class TikTokAuthService extends BasePlatformAuthService {
  protected baseUrl = "https://open.tiktokapis.com/v2";

  constructor(private tkConfig: TikTokAuthConfig) {
    super(tkConfig);
  }

  async verifyAuth(): Promise<boolean> {
    // TODO: Implement TikTok auth verification
    return true;
  }

  async refreshToken(): Promise<{ accessToken: string; expiresIn: number }> {
    // TODO: Implement TikTok token refresh
    throw new Error("TikTok token refresh not yet implemented");
  }
}

export async function createTikTokAuthServiceForUser(userId: string): Promise<TikTokAuthService> {
  const { SocialAuthRepository } = await import("@/infrastructure/repositories/social/social-auth-repo");
  const { ObjectId } = await import("mongodb");

  const repo = new SocialAuthRepository();
  const auth = await repo.getByUserAndPlatform(new ObjectId(userId), "tiktok");

  if (!auth) {
    throw new Error("TikTok account not connected for this user");
  }

  if (new Date() >= auth.expiresAt) {
    throw new Error("TikTok token has expired. Please reconnect your account.");
  }

  const config: TikTokAuthConfig = {
    clientKey: process.env.TIKTOK_CLIENT_KEY || "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
    accessToken: auth.accessToken,
    expiresAt: auth.expiresAt,
  };

  return new TikTokAuthService(config);
}

export function createTikTokAuthService(accessToken: string): TikTokAuthService {
  const config: TikTokAuthConfig = {
    clientKey: process.env.TIKTOK_CLIENT_KEY || "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
    accessToken,
  };

  return new TikTokAuthService(config);
}
