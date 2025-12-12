import type { SocialAuth } from "@/core/domain/social/social-auth"
import { validateSocialAuth, calculateExpiresAt } from "@/core/domain/social/social-auth"
import type {
  SocialAuthService,
  SocialAuthPayload,
} from "@/core/application/interfaces/social/social-auth-service"
import { ObjectId } from "mongodb"

export interface SaveWordPressTokenRequest {
  userId: ObjectId
  blogId: string // WordPress.com blog ID (stored as openId)
  blogUrl: string // WordPress site URL (stored as pageName)
  accessToken: string
  scope?: string
}

export interface SaveWordPressTokenResponse {
  success: boolean
  socialAuth?: SocialAuth
  message?: string
}

export class SaveWordPressTokenUseCase {
  constructor(private socialAuthService: SocialAuthService) { }

  async execute(
    request: SaveWordPressTokenRequest
  ): Promise<SaveWordPressTokenResponse> {
    // Check if auth already exists for this user and platform
    const existing = await this.socialAuthService.getByUserAndPlatform(
      request.userId,
      "wordpress"
    )

    // WordPress Jetpack tokens don't expire, set to 1 year
    const expiresAt = calculateExpiresAt(365 * 24 * 60 * 60) // 1 year in seconds

    const payload: SocialAuthPayload = {
      platform: "wordpress",
      openId: request.blogId,
      pageName: request.blogUrl,
      accessToken: request.accessToken,
      refreshToken: "no-need", // Jetpack tokens don't have refresh tokens
      expiresAt,
      userId: request.userId,
      scope: request.scope || "",
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
            : "Failed to save WordPress token",
      }
    }
  }
}
