import type { SocialAuth, SocialPlatform } from "@/core/domain/social/social-auth"
import type { SocialAuthService, SocialAuthPayload } from "@/core/application/interfaces/social/social-auth-service"
import { validateSocialAuth, calculateExpiresAt } from "@/core/domain/social/social-auth"
import { ObjectId } from "mongodb"
import { OAuthAdapterResolver } from "../../interfaces/social/oauth-adapter-resolver"

export interface ConnectSocialAccountRequest {
    userId: ObjectId
    platform: SocialPlatform
    code: string
}

export interface ConnectSocialAccountResponse {
    success: boolean
    socialAuth?: SocialAuth
    raw?: any // Keep raw data for page selection logic
    message?: string
}

export class ConnectSocialAccountUseCase {
    constructor(
        private readonly resolver: OAuthAdapterResolver,   // platform-specific OAuth client
        private readonly repo: SocialAuthService // DB repository
    ) { }

    async execute(
        req: ConnectSocialAccountRequest
    ): Promise<ConnectSocialAccountResponse> {
        const { userId, platform, code } = req
        const adapter = await this.resolver.getAdapter(platform);
        try {
            // 1. Ensure adapter supports code exchange
            if (!adapter.exchangeCodeForToken) {
                return {
                    success: false,
                    message: `${platform} does not support OAuth code exchange`,
                }
            }

            // 2. Exchange code → access token, refresh token, providerAccountId
            const tokenResult = await adapter.exchangeCodeForToken(code)

            if (!tokenResult) {
                return {
                    success: false,
                    message: `Failed to exchange OAuth code for ${platform}`,
                }
            }

            // 3. Prepare SocialAuth domain payload with full information
            const expiresAt = calculateExpiresAt(tokenResult.expiresIn)

            // Extract page name and scope from raw data if available
            const pageName = tokenResult.raw?.pages?.[0]?.name ||
                tokenResult.raw?.channel_name ||
                tokenResult.raw?.pageName || ""
            const scope = tokenResult.raw?.scope || tokenResult.scope || ""

            const payload: SocialAuthPayload = {
                userId,
                platform,
                accessToken: tokenResult.accessToken,
                refreshToken: tokenResult.refreshToken ?? "",
                expiresAt,
                openId: tokenResult.providerAccountId, // pageId, channelId, openId...
                pageName, // Important for UI display
                scope, // Important for permission tracking
                updatedAt: new Date(),
            }

            // 4. Validate payload before saving
            const errors = validateSocialAuth(payload as SocialAuth)
            if (errors.length > 0) {
                return {
                    success: false,
                    message: `Validation failed: ${errors.join(", ")}`,
                }
            }

            // 5. For Instagram/Facebook with multiple pages, save all pages
            // Each page gets its own social_auth record
            if ((platform === "instagram" || platform === "facebook") && tokenResult.raw?.pages) {
                const pages = tokenResult.raw.pages;
                const savedAuths: SocialAuth[] = [];

                for (const page of pages) {
                    // Skip pages without Instagram Business Account for Instagram platform
                    if (platform === "instagram" && !page.instagram_business_account?.id) {
                        continue;
                    }

                    const pagePayload: SocialAuthPayload = {
                        userId,
                        platform,
                        accessToken: page.access_token, // Use page token, not user token
                        refreshToken: page.access_token, // Use page token as refresh token
                        expiresAt: calculateExpiresAt(5184000), // 60 days for page tokens
                        openId: page.instagram_business_account?.id || page.id, // IG Business ID or Page ID
                        pageName: page.name,
                        scope: tokenResult.raw?.scope || tokenResult.scope || "",
                        updatedAt: new Date(),
                    };

                    // Check if this specific page already exists
                    // Get all auth records for this user+platform, then filter by openId
                    const allAuths = await this.repo.getAllByUser(userId);
                    const existing = allAuths.find(
                        auth => auth.platform === platform && auth.openId === pagePayload.openId
                    );

                    let saved: SocialAuth;
                    if (existing) {
                        // Update existing record for this page
                        const updated = await this.repo.update({
                            id: existing.id,
                            ...pagePayload,
                        });
                        if (updated) saved = updated;
                        else continue;
                    } else {
                        // Create new record for this page
                        saved = await this.repo.create(pagePayload);
                    }

                    if (saved) {
                        savedAuths.push(saved);
                    }
                }

                if (savedAuths.length === 0) {
                    return {
                        success: false,
                        message: `No ${platform} pages with required permissions found`,
                    };
                }

                return {
                    success: true,
                    socialAuth: savedAuths[0], // Return first page for backward compatibility
                    raw: tokenResult.raw,
                };
            }

            // 6. For other platforms, save single auth record
            const existing = await this.repo.getByUserAndPlatform(
                userId,
                platform
            )

            let saved: SocialAuth

            if (existing) {
                const updated = await this.repo.update({
                    id: existing.id,
                    ...payload,
                });
                if (!updated) {
                    return {
                        success: false,
                        message: "Failed to update OAuth credentials",
                    };
                }
                saved = updated;
            } else {
                saved = await this.repo.create(payload);
            }

            if (!saved) {
                return {
                    success: false,
                    message: "Failed to save OAuth credentials",
                }
            }

            return {
                success: true,
                socialAuth: saved,
                raw: tokenResult.raw,
            }
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : `Failed to connect ${platform} account`

            return {
                success: false,
                message,
            }
        }
    }
}
