import type { SocialAuth } from "@/core/domain/social-auth"
import type { SocialAuthService } from "@/core/application/interfaces/social-auth-service"
import { ObjectId } from "mongodb"

export interface GetFacebookAuthRequest {
  userId: ObjectId
}

export interface GetFacebookAuthResponse {
  success: boolean
  socialAuth?: SocialAuth
  message?: string
}

export class GetFacebookAuthUseCase {
  constructor(private socialAuthService: SocialAuthService) {}

  async execute(request: GetFacebookAuthRequest): Promise<GetFacebookAuthResponse> {
    try {
      const socialAuth = await this.socialAuthService.getByUserAndPlatform(
        request.userId,
        "facebook"
      )

      if (!socialAuth) {
        return {
          success: false,
          message: "Facebook account not connected",
        }
      }

      return {
        success: true,
        socialAuth,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to get Facebook auth",
      }
    }
  }
}
