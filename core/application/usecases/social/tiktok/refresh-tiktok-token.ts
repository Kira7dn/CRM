import type { SocialAuth } from "@/core/domain/social/social-auth"
import type {
  SocialAuthService,
  RefreshTokenPayload,
} from "@/core/application/interfaces/social/social-auth-service"
import type { PlatformOAuthService } from "@/core/application/interfaces/social/platform-oauth-adapter"
import { ObjectId } from "mongodb"

export interface RefreshTikTokTokenRequest {
  userId: ObjectId
}

export interface RefreshTikTokTokenResponse {
  success: boolean
  socialAuth?: SocialAuth
  message?: string
}

export class RefreshTikTokTokenUseCase {
  constructor(
    private platformOAuthService: PlatformOAuthService, // External TikTok API
    private socialAuthService: SocialAuthService      // MongoDB repository
  ) { }

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
      // 1. Call TikTok API to refresh token
      if (!this.platformOAuthService.refreshToken) {
        return {
          success: false,
          message: "Platform does not support token refresh",
        }
      }

      const tokenResult = await this.platformOAuthService.refreshToken()

      if (!tokenResult) {
        return {
          success: false,
          message: "Failed to refresh token from platform",
        }
      }

      // 2. Save new token to database
      const payload: RefreshTokenPayload = {
        userId: request.userId,
        platform: "tiktok",
        newAccessToken: tokenResult.accessToken,
        newRefreshToken: existing.refreshToken, // TikTok refresh token is reusable
        expiresInSeconds: tokenResult.expiresIn,
      }

      const socialAuth = await this.socialAuthService.refreshToken(payload)

      if (!socialAuth) {
        return {
          success: false,
          message: "Failed to save refreshed token",
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
