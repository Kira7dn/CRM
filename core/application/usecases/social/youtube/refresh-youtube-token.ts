import type { SocialAuth } from "@/core/domain/social/social-auth"
import type {
  SocialAuthService,
  RefreshTokenPayload,
} from "@/core/application/interfaces/social/social-auth-service"
import type { PlatformOAuthService } from "@/core/application/interfaces/social/platform-oauth-adapter"
import { ObjectId } from "mongodb"

export interface RefreshYouTubeTokenRequest {
  userId: ObjectId
}

export interface RefreshYouTubeTokenResponse {
  success: boolean
  socialAuth?: SocialAuth | null
  message?: string
}

export class RefreshYouTubeTokenUseCase {
  constructor(
    private PlatformOAuthService: PlatformOAuthService, // External YouTube API
    private socialAuthService: SocialAuthService      // MongoDB repository
  ) { }

  async execute(
    request: RefreshYouTubeTokenRequest
  ): Promise<RefreshYouTubeTokenResponse> {
    // Check if auth exists
    const existing = await this.socialAuthService.getByUserAndPlatform(
      request.userId,
      "youtube"
    )

    if (!existing) {
      return {
        success: false,
        message: "YouTube account not connected",
      }
    }

    try {
      // 1. Call YouTube API to refresh token
      if (!this.PlatformOAuthService.refreshToken) {
        return {
          success: false,
          message: "Platform does not support token refresh",
        }
      }

      const tokenResult = await this.PlatformOAuthService.refreshToken()

      if (!tokenResult) {
        return {
          success: false,
          message: "Failed to refresh token from platform",
        }
      }

      // 2. Save new token to database
      const payload: RefreshTokenPayload = {
        userId: request.userId,
        platform: "youtube",
        newAccessToken: tokenResult.accessToken,
        newRefreshToken: existing.refreshToken, // YouTube refresh token is reusable
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
            : "Failed to refresh YouTube token",
      }
    }
  }
}
