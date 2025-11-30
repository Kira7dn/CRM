import type { SocialAuthService } from "@/core/application/interfaces/social-auth-service"
import { ObjectId } from "mongodb"

export interface DisconnectFacebookRequest {
  userId: ObjectId
}

export interface DisconnectFacebookResponse {
  success: boolean
  message?: string
}

export class DisconnectFacebookUseCase {
  constructor(private socialAuthService: SocialAuthService) {}

  async execute(request: DisconnectFacebookRequest): Promise<DisconnectFacebookResponse> {
    try {
      const existing = await this.socialAuthService.getByUserAndPlatform(
        request.userId,
        "facebook"
      )

      if (!existing) {
        return {
          success: false,
          message: "Facebook account is not connected",
        }
      }

      const deleted = await this.socialAuthService.deleteByUserAndPlatform(
        request.userId,
        "facebook"
      )

      if (!deleted) {
        return {
          success: false,
          message: "Failed to disconnect Facebook account",
        }
      }

      return {
        success: true,
        message: "Facebook account disconnected successfully",
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to disconnect Facebook account",
      }
    }
  }
}
