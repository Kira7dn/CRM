import type { SocialAuth } from "@/core/domain/social-auth"
import type { SocialAuthService, RefreshTokenPayload } from "@/core/application/interfaces/social-auth-service"
import { ObjectId } from "mongodb"

export interface RefreshFacebookTokenRequest {
  userId: ObjectId
  newAccessToken: string
  newRefreshToken: string
  expiresInSeconds: number
}

export interface RefreshFacebookTokenResponse {
  success: boolean
  socialAuth?: SocialAuth
  message?: string
}

export class RefreshFacebookTokenUseCase {
  constructor(private socialAuthService: SocialAuthService) {}

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
      const payload: RefreshTokenPayload = {
        userId: request.userId,
        platform: "facebook",
        newAccessToken: request.newAccessToken,
        newRefreshToken: request.newRefreshToken,
        expiresInSeconds: request.expiresInSeconds,
      }

      const socialAuth = await this.socialAuthService.refreshToken(payload)

      if (!socialAuth) {
        return {
          success: false,
          message: "Failed to refresh Facebook token",
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
