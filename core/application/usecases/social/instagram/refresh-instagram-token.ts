import type { SocialAuth } from "@/core/domain/social/social-auth";
import type {
  SocialAuthService,
  RefreshTokenPayload,
} from "@/core/application/interfaces/social/social-auth-service";
import type { PlatformOAuthService } from "@/core/application/interfaces/social/platform-oauth-adapter";
import type { ObjectId } from "mongodb";

export interface RefreshInstagramTokenRequest {
  userId: ObjectId;
}

export interface RefreshInstagramTokenResponse {
  success: boolean;
  socialAuth?: SocialAuth;
  message?: string;
}

/**
 * Use Case: Refresh Instagram Token
 *
 * Refreshes a long-lived Instagram access token before it expires
 * Instagram long-lived tokens last 60 days and can be refreshed
 */
export class RefreshInstagramTokenUseCase {
  constructor(
    private PlatformOAuthService: PlatformOAuthService, // External Instagram API
    private socialAuthService: SocialAuthService      // MongoDB repository
  ) { }

  async execute(request: RefreshInstagramTokenRequest): Promise<RefreshInstagramTokenResponse> {
    // Check if auth exists
    const existing = await this.socialAuthService.getByUserAndPlatform(
      request.userId,
      "instagram"
    );

    if (!existing) {
      return {
        success: false,
        message: "Instagram account not connected",
      };
    }

    try {
      // 1. Call Instagram API to refresh token
      if (!this.PlatformOAuthService.refreshToken) {
        return {
          success: false,
          message: "Platform does not support token refresh",
        };
      }

      const tokenResult = await this.PlatformOAuthService.refreshToken();

      if (!tokenResult) {
        return {
          success: false,
          message: "Failed to refresh token from platform",
        };
      }

      // 2. Save new token to database
      const payload: RefreshTokenPayload = {
        userId: request.userId,
        platform: "instagram",
        newAccessToken: tokenResult.accessToken,
        newRefreshToken: "", // Instagram doesn't use refresh tokens
        expiresInSeconds: tokenResult.expiresIn,
      };

      const socialAuth = await this.socialAuthService.refreshToken(payload);

      if (!socialAuth) {
        return {
          success: false,
          message: "Failed to save refreshed token",
        };
      }

      return {
        success: true,
        socialAuth,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to refresh Instagram token",
      };
    }
  }
}
