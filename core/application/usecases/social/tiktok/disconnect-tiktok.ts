import type { SocialAuthService } from "@/core/application/interfaces/social-auth-service"
import { ObjectId } from "mongodb"

export interface DisconnectTikTokRequest {
  userId: ObjectId
}

export interface DisconnectTikTokResponse {
  success: boolean
  message?: string
}

export class DisconnectTikTokUseCase {
  constructor(private socialAuthService: SocialAuthService) {}

  async execute(
    request: DisconnectTikTokRequest
  ): Promise<DisconnectTikTokResponse> {
    try {
      // Check if connection exists
      const existing = await this.socialAuthService.getByUserAndPlatform(
        request.userId,
        "tiktok"
      )

      if (!existing) {
        return {
          success: false,
          message: "TikTok account is not connected",
        }
      }

      // Delete the connection
      const deleted = await this.socialAuthService.deleteByUserAndPlatform(
        request.userId,
        "tiktok"
      )

      if (!deleted) {
        return {
          success: false,
          message: "Failed to disconnect TikTok account",
        }
      }

      return {
        success: true,
        message: "TikTok account disconnected successfully",
      }
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to disconnect TikTok account",
      }
    }
  }
}
