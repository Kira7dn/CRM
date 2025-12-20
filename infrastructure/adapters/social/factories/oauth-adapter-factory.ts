import type { OAuthAdapterResolver, PlatformOAuthAdapter } from "@/core/application/interfaces/social/platform-oauth-adapter";
import { Platform } from "@/core/domain/marketing/post";

export class OAuthAdapterFactory implements OAuthAdapterResolver {

    async getAdapter(platform: Platform): Promise<PlatformOAuthAdapter> {

        switch (platform) {

            case "facebook": {
                const { FacebookOAuthAdapter } = await import("../oauth/facebook-oauth-adapter");
                return new FacebookOAuthAdapter({
                    appId: process.env.FACEBOOK_APP_ID!,
                    appSecret: process.env.FACEBOOK_APP_SECRET!,
                    redirectUri: process.env.FACEBOOK_REDIRECT_URI!,
                });
            }

            case "instagram": {
                const { InstagramOAuthAdapter } = await import("../oauth/instagram-oauth-adapter");
                return new InstagramOAuthAdapter({
                    appId: process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID!,
                    appSecret: process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET!,
                    redirectUri: process.env.INSTAGRAM_REDIRECT_URI!,
                });
            }

            case "tiktok": {
                const { TikTokOAuthAdapter } = await import("../oauth/tiktok-oauth-adapter");
                return new TikTokOAuthAdapter({
                    clientKey: process.env.TIKTOK_CLIENT_KEY!,
                    clientSecret: process.env.TIKTOK_CLIENT_SECRET!,
                    redirectUri: process.env.TIKTOK_REDIRECT_URI!,
                });
            }

            case "youtube": {
                const { YouTubeOAuthAdapter } = await import("../oauth/youtube-oauth-adapter");
                return new YouTubeOAuthAdapter({
                    clientId: process.env.YOUTUBE_CLIENT_ID!,
                    clientSecret: process.env.YOUTUBE_CLIENT_SECRET!,
                    redirectUri: process.env.YOUTUBE_REDIRECT_URI!,
                });
            }

            case "wordpress": {
                const { WordPressOAuthAdapter } = await import("../oauth/wordpress-oauth-adapter");
                return new WordPressOAuthAdapter({
                    clientId: process.env.WP_CLIENT_ID!,
                    clientSecret: process.env.WP_CLIENT_SECRET!,
                    redirectUri: process.env.WP_REDIRECT_URI!,
                });
            }

            default:
                throw new Error(`Unsupported OAuth platform: ${platform}`);
        }
    }
}
