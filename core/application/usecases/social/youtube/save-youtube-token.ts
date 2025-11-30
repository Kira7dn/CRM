import type { SocialAuth } from "@/core/domain/social-auth"
import { validateSocialAuth, calculateExpiresAt } from "@/core/domain/social-auth"
import type {
  SocialAuthService,
  SocialAuthPayload,
} from "@/core/application/interfaces/social-auth-service"
import { ObjectId } from "mongodb"

export interface SaveYouTubeTokenRequest {
  userId: ObjectId
  openId: string
  pageName: string
  accessToken: string
  refreshToken: string
  expiresInSeconds: number
  scope?: string
}

export interface SaveYouTubeTokenResponse {
  success: boolean
  socialAuth?: SocialAuth
  message?: string
}

export class SaveYouTubeTokenUseCase {
  constructor(private socialAuthService: SocialAuthService) {}

  async execute(
    request: SaveYouTubeTokenRequest
  ): Promise<SaveYouTubeTokenResponse> {
    const existing = await this.socialAuthService.getByUserAndPlatform(
      request.userId,
      "youtube"
    )

    const expiresAt = calculateExpiresAt(request.expiresInSeconds)

    const payload: SocialAuthPayload = {
      platform: "youtube",
      openId: request.openId,
      pageName: request.pageName,
      accessToken: request.accessToken,
      refreshToken: request.refreshToken,
      expiresAt,
      userId: request.userId,
      scope: request.scope,
    }

    const errors = validateSocialAuth(payload as SocialAuth)
    if (errors.length > 0) {
      return {
        success: false,
        message: `Validation failed: ${errors.join(", ")}`,
      }
    }

    try {
      let socialAuth: SocialAuth

      if (existing) {
        socialAuth =
          (await this.socialAuthService.update({
            ...payload,
            id: existing.id,
          })) ||
          ({} as SocialAuth)
      } else {
        socialAuth = await this.socialAuthService.create(payload)
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
            : "Failed to save YouTube token",
      }
    }
  }
}
