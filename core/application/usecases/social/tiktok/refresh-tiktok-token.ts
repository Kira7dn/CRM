import type { SocialAuth } from "@/core/domain/social-auth"
import type {
  SocialAuthService,
  RefreshTokenPayload,
} from "@/core/application/interfaces/social-auth-service"
import { ObjectId } from "mongodb"

export interface RefreshTikTokTokenRequest {
  userId: ObjectId
  newAccessToken: string
  newRefreshToken: string
  expiresInSeconds: number
}

export interface RefreshTikTokTokenResponse {
  success: boolean
  socialAuth?: SocialAuth
  message?: string
}

export class RefreshTikTokTokenUseCase {
  constructor(private socialAuthService: SocialAuthService) {}

  async execute(
    request: RefreshTikTokTokenRequest
  ): Promise<RefreshTikTokTokenResponse> {
    // Check if auth exists
    const existing = await this.socialAuthService.getByUserAndPlatform(
      request.userId,
      "tiktok"
    )

    if (!existing) {
      return {
        success: false,
        message: "TikTok account not connected",
      }
    }

    try {
      const payload: RefreshTokenPayload = {
        userId: request.userId,
        platform: "tiktok",
        newAccessToken: request.newAccessToken,
        newRefreshToken: request.newRefreshToken,
        expiresInSeconds: request.expiresInSeconds,
      }

      const socialAuth = await this.socialAuthService.refreshToken(payload)

      if (!socialAuth) {
        return {
          success: false,
          message: "Failed to refresh TikTok token",
        }
      }

      return {
        success: true,
        socialAuth,
      }
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to refresh TikTok token",
      }
    }
  }
}
