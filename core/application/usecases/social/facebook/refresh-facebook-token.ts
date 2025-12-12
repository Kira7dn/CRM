import type { SocialAuth } from "@/core/domain/social/social-auth"
import type { SocialAuthService, RefreshTokenPayload } from "@/core/application/interfaces/social/social-auth-service"
import type { PlatformOAuthService } from "@/core/application/interfaces/social/platform-oauth-adapter"
import { ObjectId } from "mongodb"

export interface RefreshFacebookTokenRequest {
  userId: ObjectId
}

export interface RefreshFacebookTokenResponse {
  success: boolean
  socialAuth?: SocialAuth
  message?: string
}

export class RefreshFacebookTokenUseCase {
  constructor(
    private PlatformOAuthService: PlatformOAuthService, // External Facebook API
    private socialAuthService: SocialAuthService      // MongoDB repository
  ) { }

  async execute(request: RefreshFacebookTokenRequest): Promise<RefreshFacebookTokenResponse> {
    const existing = await this.socialAuthService.getByUserAndPlatform(
      request.userId,
      "facebook"
    )

    if (!existing) {
      return {
        success: false,
        message: "Facebook account not connected",
      }
    }

    try {
      // 1. Call Facebook API to refresh token
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
        platform: "facebook",
        newAccessToken: tokenResult.accessToken,
        newRefreshToken: "", // Facebook uses long-lived tokens, no refresh token
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
        message: error instanceof Error ? error.message : "Failed to refresh Facebook token",
      }
    }
  }
}
