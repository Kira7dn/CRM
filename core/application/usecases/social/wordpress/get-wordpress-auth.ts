import type { SocialAuth } from "@/core/domain/social/social-auth"
import type { SocialAuthService } from "@/core/application/interfaces/social/social-auth-service"
import { ObjectId } from "mongodb"

export interface GetWordpressAuthRequest {
  userId: ObjectId
}

export interface GetWordpressAuthResponse {
  success: boolean
  socialAuth?: SocialAuth
  message?: string
}

export class GetWordpressAuthUseCase {
  constructor(private socialAuthService: SocialAuthService) { }

  async execute(
    request: GetWordpressAuthRequest
  ): Promise<GetWordpressAuthResponse> {
    try {
      const socialAuth = await this.socialAuthService.getByUserAndPlatform(
        request.userId,
        "wordpress"
      )

      if (!socialAuth) {
        return {
          success: false,
          message: "WordPress account not connected",
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
            : "Failed to get WordPress auth",
      }
    }
  }
}
