import type { SocialAuthService } from "@/core/application/interfaces/social/social-auth-service";
import type { ObjectId } from "mongodb";

export interface SaveInstagramTokenRequest {
  userId: ObjectId;
  accessToken: string;
  expiresIn: number;
  instagramBusinessAccountId: string;
  username: string;
  pageId?: string; // Facebook Page ID linked to Instagram
  scopes?: string[];
}

export interface SaveInstagramTokenResponse {
  success: boolean;
  channelId?: string;
}

/**
 * Use Case: Save Instagram OAuth Token
 *
 * Stores the Instagram Business Account access token and metadata
 * after successful OAuth authentication via Facebook
 */
export class SaveInstagramTokenUseCase {
  constructor(private socialAuthService: SocialAuthService) { }

  async execute(request: SaveInstagramTokenRequest): Promise<SaveInstagramTokenResponse> {
    try {
      // Calculate expiration date
      const expiresAt = new Date(Date.now() + request.expiresIn * 1000);

      // Save to repository
      const auth = await this.socialAuthService.create({
        userId: request.userId,
        platform: "instagram",
        accessToken: request.accessToken,
        refreshToken: "", // Instagram doesn't use refresh tokens, it uses long-lived tokens
        expiresAt,
        openId: request.pageId || request.instagramBusinessAccountId, // Store Facebook Page ID
        channelId: request.instagramBusinessAccountId, // Store Instagram Business Account ID
        pageName: request.username,
        scope: request.scopes?.join(",") || "instagram_basic,instagram_content_publish",
      });

      return {
        success: true,
        channelId: auth.channelId,
      };
    } catch (error) {
      console.error("[SaveInstagramTokenUseCase] Error:", error);
      throw error;
    }
  }
}
