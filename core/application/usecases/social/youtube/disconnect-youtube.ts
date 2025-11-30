import type { SocialAuthService } from "@/core/application/interfaces/social-auth-service"
import { ObjectId } from "mongodb"

export interface DisconnectYouTubeRequest {
  userId: ObjectId
}

export interface DisconnectYouTubeResponse {
  success: boolean
  message?: string
}

export class DisconnectYouTubeUseCase {
  constructor(private socialAuthService: SocialAuthService) {}

  async execute(
    request: DisconnectYouTubeRequest
  ): Promise<DisconnectYouTubeResponse> {
    try {
      const deleted = await this.socialAuthService.deleteByUserAndPlatform(
        request.userId,
        "youtube"
      )

      if (!deleted) {
        return {
          success: false,
          message: "YouTube account not found or already disconnected",
        }
      }

      return {
        success: true,
        message: "YouTube account disconnected successfully",
      }
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to disconnect YouTube account",
      }
    }
  }
}
