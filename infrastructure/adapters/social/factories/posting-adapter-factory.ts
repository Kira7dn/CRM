// infrastructure/adapters/external/social/factories/posting-adapter-factory.ts

import type { SocialAuth } from "@/core/domain/social/social-auth";
import { isTokenExpired } from "@/core/domain/social/social-auth";
import type { PostingAdapter, PostingAdapterFactory } from "@/core/application/interfaces/marketing/posting-adapter";
import { OAuthAdapterFactory } from "./oauth-adapter-factory";
import { SocialAuthRepository } from "@/infrastructure/repositories/social/social-auth-repo";
import { ObjectId } from "mongodb";
import type { Platform } from "@/core/domain/marketing/post";

/**
 * Auth service wrapper interface
 */
interface AuthServiceWrapper {
    getAccessToken: () => string;
    getPageId: () => string;
    verifyAuth: () => Promise<boolean>;
    auth: SocialAuth;
}

/**
 * Platform Posting Adapter Factory
 * Creates posting adapters with automatic token validation and refresh
 */
export class PlatformPostingAdapterFactory implements PostingAdapterFactory {
    private authServiceCache: Map<string, AuthServiceWrapper> = new Map();
    private postingAdapterCache: Map<string, PostingAdapter> = new Map();
    private socialAuthRepo: SocialAuthRepository;

    constructor() {
        this.socialAuthRepo = new SocialAuthRepository();
    }

    /**
     * Create Posting Adapter with automatic token management
     * @param platform - Social media platform
     * @param userIdOrAuth - User ID (ObjectId or string) or SocialAuth object (for backwards compatibility)
     */
    async create(platform: Platform, userIdOrAuth: ObjectId | string | SocialAuth): Promise<PostingAdapter> {
        // Validate platform is a social platform

        let auth: SocialAuth | null;
        let userId: ObjectId;

        // Handle different input types
        if (typeof userIdOrAuth === 'object' && 'platform' in userIdOrAuth) {
            // Legacy mode: SocialAuth object provided
            auth = userIdOrAuth as SocialAuth;
            userId = auth.userId;
        } else {
            // New mode: userId provided, fetch auth from DB
            userId = typeof userIdOrAuth === 'string' ? new ObjectId(userIdOrAuth) : userIdOrAuth;
            auth = await this.socialAuthRepo.getByUserAndPlatform(userId, platform);

            if (!auth) {
                throw new Error(`No social auth found for user ${userId.toString()} on ${platform}`);
            }
        }

        const cacheKey = `${platform}-${userId.toString()}`;

        // Check if token is expired and refresh if needed
        if (isTokenExpired(auth.expiresAt)) {
            console.log(`Token expired for ${platform} (user: ${userId.toString()}), refreshing...`);

            try {
                auth = await this.refreshTokenIfNeeded(platform, auth);
                // Clear cache to force recreation with new token
                this.clearUserCache(platform, userId.toString());
            } catch (error) {
                console.error(`Token refresh failed for ${platform}:`, error);
                // Throw error with helpful message asking user to re-authenticate
                throw new Error(
                    `${platform} access token expired and could not be refreshed. ` +
                    `Please re-connect your ${platform} account in Settings > Social Connections.`
                );
            }
        }

        /** Return cached adapter if available and token is still valid */
        if (this.postingAdapterCache.has(cacheKey)) {
            return this.postingAdapterCache.get(cacheKey)!;
        }

        /** Create or reuse AuthService (stateful API runtime client) */
        const authService = await this.getOrCreateAuthService(platform, auth);

        // Debug: Check openId type and value
        console.log("[Factory] Auth openId debug:", {
            platform,
            openId: auth.openId,
            openIdType: typeof auth.openId,
            openIdLength: auth.openId?.toString().length
        });

        /** Create posting adapter */
        const postingAdapter = await this.createPostingAdapter(platform, authService);

        /** Cache the adapter */
        this.postingAdapterCache.set(cacheKey, postingAdapter);

        return postingAdapter;
    }

    /**
     * Refresh token if expired
     */
    private async refreshTokenIfNeeded(platform: Platform, auth: SocialAuth): Promise<SocialAuth> {
        if (!auth.refreshToken && !auth.accessToken) {
            throw new Error(`Cannot refresh token for ${platform}: No refresh token or access token available`);
        }

        try {
            const oauthAdapter = await new OAuthAdapterFactory().getAdapter(platform);

            // Use refreshToken if available, otherwise use accessToken (for Facebook/Instagram)
            const tokenToRefresh = auth.refreshToken || auth.accessToken;

            if (!oauthAdapter.refreshToken) {
                throw new Error(`Platform ${platform} does not support token refresh`);
            }

            const refreshResult = await oauthAdapter.refreshToken(tokenToRefresh);

            // Update token in database
            const updatedAuth = await this.socialAuthRepo.refreshToken({
                userId: auth.userId,
                platform: auth.platform,
                newAccessToken: refreshResult.accessToken,
                newRefreshToken: refreshResult.refreshToken || auth.refreshToken || auth.accessToken,
                expiresInSeconds: refreshResult.expiresIn,
            });

            if (!updatedAuth) {
                throw new Error(`Failed to update refreshed token in database for ${platform}`);
            }

            console.log(`Token refreshed successfully for ${platform} (user: ${auth.userId.toString()})`);
            return updatedAuth;

        } catch (error) {
            console.error(`Failed to refresh token for ${platform}:`, error);
            throw new Error(`Token refresh failed for ${platform}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Create a simple auth service wrapper for posting adapters
     * Provides getAccessToken() and getPageId() methods
     */
    private createAuthServiceWrapper(auth: SocialAuth): AuthServiceWrapper {
        return {
            getAccessToken: () => auth.accessToken,
            getPageId: () => auth.openId, // openId stores pageId/channelId
            verifyAuth: async () => {
                const oauthAdapter = await new OAuthAdapterFactory().getAdapter(auth.platform);
                return await oauthAdapter.verifyAccessToken(auth.accessToken);
            },
            // For backwards compatibility
            auth: auth,
        };
    }

    /**
     * Create or reuse auth service wrapper (stateful)
     */
    private async getOrCreateAuthService(platform: Platform, auth: SocialAuth): Promise<AuthServiceWrapper> {
        const cacheKey = `${platform}-${auth.userId.toString()}`;

        const cached = this.authServiceCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        // Create auth service wrapper with current credentials
        const authService = this.createAuthServiceWrapper(auth);

        this.authServiceCache.set(cacheKey, authService);

        return authService;
    }

    /**
     * Build platform-specific Posting Adapter
     */
    private async createPostingAdapter(platform: Platform, authService: AuthServiceWrapper): Promise<PostingAdapter> {
        // Extract token and platform-specific data from authService
        const token = authService.getAccessToken();
        const pageId = authService.getPageId();
        const auth = authService.auth;

        switch (platform) {
            case "facebook": {
                const { FacebookPostingAdapter } = await import("../posting/facebook-posting-adapter");
                return new FacebookPostingAdapter(token, pageId);
            }

            case "instagram": {
                const { InstagramPostingAdapter } = await import("../posting/instagram-posting-adapter");
                console.log("[Factory] Creating Instagram adapter:", {
                    platform,
                    igAccountId: pageId,
                    tokenPrefix: token.substring(0, 20) + '...',
                    tokenLength: token.length,
                    authExpiresAt: auth.expiresAt,
                    authScope: auth.scope
                });
                return new InstagramPostingAdapter(token, pageId);
            }

            case "tiktok": {
                const { TikTokPostingAdapter } = await import("../posting/tiktok-posting-adapter");
                return new TikTokPostingAdapter(token);
            }

            case "youtube": {
                const { YouTubePostingAdapter } = await import("../posting/youtube-posting-adapter");
                return new YouTubePostingAdapter(token);
            }

            case "wordpress": {
                const { WordPressPostingAdapter } = await import("../posting/wordpress-posting-adapter");
                // WordPress needs siteId and siteUrl from auth metadata
                return new WordPressPostingAdapter(token, {
                    siteId: auth.openId,
                    siteUrl: auth.metadata?.siteUrl as string | undefined
                });
            }

            case "zalo": {
                const { ZaloPostingAdapter } = await import("../posting/zalo-posting-adapter");
                return new ZaloPostingAdapter(token);
            }

            default:
                throw new Error(`Unsupported posting platform: ${platform}`);
        }
    }

    /** Clear all (optional for logout or user revoke) */
    clearCache(): void {
        this.authServiceCache.clear();
        this.postingAdapterCache.clear();
    }

    clearUserCache(platform: Platform, userId: string): void {
        const key = `${platform}-${userId}`;
        this.authServiceCache.delete(key);
        this.postingAdapterCache.delete(key);
    }
}

/** Singleton accessor */
let instance: PlatformPostingAdapterFactory | null = null;

export function getPostingAdapterFactory(): PlatformPostingAdapterFactory {
    if (!instance) instance = new PlatformPostingAdapterFactory();
    return instance;
}
