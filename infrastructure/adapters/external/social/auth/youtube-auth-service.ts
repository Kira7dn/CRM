import { BasePlatformAuthService } from "./platform-auth-service";
import type { PlatformAuthConfig } from "@/core/application/interfaces/social/auth-service";

export interface YouTubeAuthConfig extends PlatformAuthConfig {
  apiKey: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export class YouTubeAuthService extends BasePlatformAuthService {
  protected baseUrl = "https://www.googleapis.com/youtube/v3";

  constructor(private ytConfig: YouTubeAuthConfig) {
    super(ytConfig);
  }

  async verifyAuth(): Promise<boolean> {
    // TODO: Implement YouTube auth verification
    return true;
  }

  async refreshToken(): Promise<{ accessToken: string; expiresIn: number }> {
    // TODO: Implement YouTube token refresh
    throw new Error("YouTube token refresh not yet implemented");
  }
}

export async function createYouTubeAuthServiceForUser(userId: string): Promise<YouTubeAuthService> {
  const { SocialAuthRepository } = await import("@/infrastructure/repositories/social/social-auth-repo");
  const { ObjectId } = await import("mongodb");

  const repo = new SocialAuthRepository();
  const auth = await repo.getByUserAndPlatform(new ObjectId(userId), "youtube");

  if (!auth) {
    throw new Error("YouTube account not connected for this user");
  }

  const config: YouTubeAuthConfig = {
    apiKey: process.env.YOUTUBE_API_KEY || "",
    clientId: process.env.YOUTUBE_CLIENT_ID || "",
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || "",
    refreshToken: auth.refreshToken,
    accessToken: auth.accessToken,
    expiresAt: auth.expiresAt,
  };

  return new YouTubeAuthService(config);
}
