import type { SocialAuth } from "@/core/domain/social-auth"
import type { SocialAuthService } from "@/core/application/interfaces/social-auth-service"
import { ObjectId } from "mongodb"

export interface GetTikTokAuthRequest {
  userId: ObjectId
}

export interface GetTikTokAuthResponse {
  success: boolean
  socialAuth?: SocialAuth
  message?: string
}

export class GetTikTokAuthUseCase {
  constructor(private socialAuthService: SocialAuthService) {}

  async execute(
    request: GetTikTokAuthRequest
  ): Promise<GetTikTokAuthResponse> {
    try {
      const socialAuth = await this.socialAuthService.getByUserAndPlatform(
        request.userId,
        "tiktok"
      )

      if (!socialAuth) {
        return {
          success: false,
          message: "TikTok account not connected",
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
            : "Failed to get TikTok auth",
      }
    }
  }
}
