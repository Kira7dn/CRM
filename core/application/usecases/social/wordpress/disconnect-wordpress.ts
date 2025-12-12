import type { SocialAuthService } from "@/core/application/interfaces/social/social-auth-service"
import { ObjectId } from "mongodb"

export interface DisconnectWordPressRequest {
  userId: ObjectId
}

export interface DisconnectWordPressResponse {
  success: boolean
  message?: string
}

export class DisconnectWordPressUseCase {
  constructor(private socialAuthService: SocialAuthService) {}

  async execute(request: DisconnectWordPressRequest): Promise<DisconnectWordPressResponse> {
    try {
      const existing = await this.socialAuthService.getByUserAndPlatform(
        request.userId,
        "wordpress"
      )

      if (!existing) {
        return {
          success: false,
          message: "WordPress account is not connected",
        }
      }

      const deleted = await this.socialAuthService.deleteByUserAndPlatform(
        request.userId,
        "wordpress"
      )

      if (!deleted) {
        return {
          success: false,
          message: "Failed to disconnect WordPress account",
        }
      }

      return {
        success: true,
        message: "WordPress account disconnected successfully",
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to disconnect WordPress account",
      }
    }
  }
}
