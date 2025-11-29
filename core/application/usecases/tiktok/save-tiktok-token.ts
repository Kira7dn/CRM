import type { SocialAuth } from "@/core/domain/social-auth"
import { validateSocialAuth, calculateExpiresAt } from "@/core/domain/social-auth"
import type {
  SocialAuthService,
  SocialAuthPayload,
} from "@/core/application/interfaces/social-auth-service"
import { ObjectId } from "mongodb"

export interface SaveTikTokTokenRequest {
  userId: ObjectId
  openId: string
  pageName: string
  accessToken: string
  refreshToken: string
  expiresInSeconds: number
  scope?: string
}

export interface SaveTikTokTokenResponse {
  success: boolean
  socialAuth?: SocialAuth
  message?: string
}

export class SaveTikTokTokenUseCase {
  constructor(private socialAuthService: SocialAuthService) { }

  async execute(
    request: SaveTikTokTokenRequest
  ): Promise<SaveTikTokTokenResponse> {
    // Check if auth already exists for this user and platform
    const existing = await this.socialAuthService.getByUserAndPlatform(
      request.userId,
      "tiktok"
    )

    const expiresAt = calculateExpiresAt(request.expiresInSeconds)

    const payload: SocialAuthPayload = {
      platform: "tiktok",
      openId: request.openId,
      pageName: request.pageName,
      accessToken: request.accessToken,
      refreshToken: request.refreshToken,
      expiresAt,
      userId: request.userId,
      scope: request.scope,
    }

    // Validate payload
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
        // Update existing record
        socialAuth =
          (await this.socialAuthService.update({
            ...payload,
            id: existing.id,
          })) ||
          ({} as SocialAuth)
      } else {
        // Create new record
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
            : "Failed to save TikTok token",
      }
    }
  }
}
