// infrastructure/adapters/external/social/factories/posting-adapter-factory.ts

import type { SocialPlatform, SocialAuth } from "@/core/domain/social/social-auth";
import type { PostingService, PostingAdapterFactory } from "@/core/application/interfaces/marketing/posting-adapter";
import { AuthServiceFactory } from "./auth-service-factory";

/**
 * Platform Posting Adapter Factory
 * Creates posting adapters using AuthService (stateful, platform API client)
 */
export class PlatformPostingAdapterFactory implements PostingAdapterFactory {
    private authServiceCache: Map<string, any> = new Map();
    private postingAdapterCache: Map<string, PostingService> = new Map();

    /**
     * Create Posting Adapter
     * - Requires SocialAuth from DB
     */
    async create(platform: SocialPlatform, auth: SocialAuth): Promise<PostingService> {
        if (!auth || !auth.userId) {
            throw new Error(`Invalid SocialAuth object for ${platform}`);
        }

        const cacheKey = `${platform}-${auth.userId.toString()}`;

        /** Return cached adapter */
        if (this.postingAdapterCache.has(cacheKey)) {
            return this.postingAdapterCache.get(cacheKey)!;
        }

        /** Create or reuse AuthService (stateful API runtime client) */
        const authService = await this.getOrCreateAuthService(platform, auth);

        /** Create posting adapter */
        const postingAdapter = await this.createPostingAdapter(platform, authService);

        /** Cache the adapter */
        this.postingAdapterCache.set(cacheKey, postingAdapter);

        return postingAdapter;
    }

    /**
     * Create AuthService via AuthServiceFactory (stateful)
     */
    private async getOrCreateAuthService(platform: SocialPlatform, auth: SocialAuth) {
        const cacheKey = `${platform}-${auth.userId.toString()}`;

        if (this.authServiceCache.has(cacheKey)) {
            return this.authServiceCache.get(cacheKey);
        }

        // ❗ AuthServiceFactory returns AuthService, NOT OAuthAdapter
        const authService = await AuthServiceFactory.create(platform, auth);

        this.authServiceCache.set(cacheKey, authService);

        return authService;
    }

    /**
     * Build platform-specific Posting Adapter
     */
    private async createPostingAdapter(platform: SocialPlatform, authService: any): Promise<PostingService> {
        switch (platform) {
            case "facebook": {
                const { FacebookPostingAdapter } = await import("../posting/facebook-posting-adapter");
                return new FacebookPostingAdapter(authService);
            }

            case "instagram": {
                const { InstagramPostingAdapter } = await import("../posting/instagram-posting-adapter");
                return new InstagramPostingAdapter(authService);
            }

            case "tiktok": {
                const { TikTokPostingAdapter } = await import("../posting/tiktok-posting-adapter");
                return new TikTokPostingAdapter(authService);
            }

            case "youtube": {
                const { YouTubePostingAdapter } = await import("../posting/youtube-posting-adapter");
                return new YouTubePostingAdapter(authService);
            }

            case "wordpress": {
                const { WordPressPostingAdapter } = await import("../posting/wordpress-posting-adapter");
                return new WordPressPostingAdapter(authService);
            }

            case "zalo": {
                const { ZaloPostingAdapter } = await import("../posting/zalo-posting-adapter");
                return new ZaloPostingAdapter(authService);
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

    clearUserCache(platform: SocialPlatform, userId: string): void {
        const key = `${platform}-${userId}`;
        this.authServiceCache.delete(key);
        this.postingAdapterCache.delete(key);
    }

    /** Supported platforms */
    getSupportedPlatforms(): SocialPlatform[] {
        return ["facebook", "instagram", "tiktok", "youtube", "wordpress", "zalo"];
    }
}

/** Singleton accessor */
let instance: PlatformPostingAdapterFactory | null = null;

export function getPostingAdapterFactory(): PlatformPostingAdapterFactory {
    if (!instance) instance = new PlatformPostingAdapterFactory();
    return instance;
}
