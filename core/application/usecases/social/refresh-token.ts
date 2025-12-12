import type { SocialAuth, SocialPlatform } from "@/core/domain/social/social-auth";
import type {
    SocialAuthService,
    RefreshTokenPayload,
} from "@/core/application/interfaces/social/social-auth-service";
import type { PlatformOAuthAdapter } from "@/core/application/interfaces/social/platform-oauth-adapter";
import { ObjectId } from "mongodb";
import { OAuthAdapterResolver } from "../../interfaces/social/oauth-adapter-resolver";

export interface RefreshTokenRequest {
    userId: ObjectId;
    platform: SocialPlatform;
}

export interface RefreshTokenResponse {
    success: boolean;
    socialAuth?: SocialAuth;
    message?: string;
}

export class RefreshTokenUseCase {
    constructor(
        private readonly resolver: OAuthAdapterResolver, // Adapter (provider API)
        private readonly repo: SocialAuthService         // Repository (MongoDB)
    ) { }

    async execute(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
        const { userId, platform } = request;
        const adapter = await this.resolver.getAdapter(platform);

        // 1. Load existing auth record
        const existing = await this.repo.getByUserAndPlatform(
            userId,
            platform
        );

        if (!existing) {
            return {
                success: false,
                message: `${platform} account not connected`,
            };
        }

        // Ensure provider supports refresh
        if (!adapter.refreshToken) {
            return {
                success: false,
                message: `${platform} does not support token refresh`,
            };
        }

        try {
            // 2. Call provider API to refresh token
            const tokenResult = await adapter.refreshToken(
                existing.refreshToken ?? ""
            );

            if (!tokenResult) {
                return {
                    success: false,
                    message: `Failed to refresh ${platform} token from provider`,
                };
            }

            // 3. Save refreshed token into DB
            const payload: RefreshTokenPayload = {
                userId,
                platform,
                newAccessToken: tokenResult.accessToken,
                newRefreshToken: tokenResult.refreshToken ?? "", // some platforms don't return one
                expiresInSeconds: tokenResult.expiresIn,
            };

            const updated = await this.repo.refreshToken(payload);

            if (!updated) {
                return {
                    success: false,
                    message: "Failed to save refreshed token",
                };
            }

            return {
                success: true,
                socialAuth: updated,
            };
        } catch (error) {
            const msg =
                error instanceof Error
                    ? error.message
                    : `Failed to refresh ${platform} token`;

            return {
                success: false,
                message: msg,
            };
        }
    }
}
