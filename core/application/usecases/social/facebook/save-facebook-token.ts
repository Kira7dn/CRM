import type { SocialAuth } from "@/core/domain/social-auth"
import { validateSocialAuth, calculateExpiresAt } from "@/core/domain/social-auth"
import type {
  SocialAuthService,
  SocialAuthPayload,
} from "@/core/application/interfaces/social-auth-service"
import { ObjectId } from "mongodb"

export interface SaveFacebookTokenRequest {
  userId: ObjectId
  openId: string
  pageName: string
  accessToken: string
  refreshToken: string
  expiresInSeconds: number
  scope?: string
}

export interface SaveFacebookTokenResponse {
  success: boolean
  socialAuth?: SocialAuth
  message?: string
}

export class SaveFacebookTokenUseCase {
  constructor(private socialAuthService: SocialAuthService) { }

  async execute(
    request: SaveFacebookTokenRequest
  ): Promise<SaveFacebookTokenResponse> {
    const existing = await this.socialAuthService.getByUserAndPlatform(
      request.userId,
      "facebook"
    )

    const expiresAt = calculateExpiresAt(request.expiresInSeconds)

    const payload: SocialAuthPayload = {
      platform: "facebook",
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
            : "Failed to save Facebook token",
      }
    }
  }
}
