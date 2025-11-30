import type { SocialAuth } from "@/core/domain/social-auth"
import { calculateExpiresAt } from "@/core/domain/social-auth"
import type {
  SocialAuthService,
  RefreshTokenPayload,
} from "@/core/application/interfaces/social-auth-service"
import { ObjectId } from "mongodb"

export interface RefreshYouTubeTokenRequest {
  userId: ObjectId
  newAccessToken: string
  newRefreshToken: string
  expiresInSeconds: number
}

export interface RefreshYouTubeTokenResponse {
  success: boolean
  socialAuth?: SocialAuth | null
  message?: string
}

export class RefreshYouTubeTokenUseCase {
  constructor(private socialAuthService: SocialAuthService) {}

  async execute(
    request: RefreshYouTubeTokenRequest
  ): Promise<RefreshYouTubeTokenResponse> {
    try {
      const payload: RefreshTokenPayload = {
        userId: request.userId,
        platform: "youtube",
        newAccessToken: request.newAccessToken,
        newRefreshToken: request.newRefreshToken,
        expiresInSeconds: request.expiresInSeconds
      }

      const socialAuth = await this.socialAuthService.refreshToken(payload)

      if (!socialAuth) {
        return {
          success: false,
          message: "YouTube account not found or update failed",
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
