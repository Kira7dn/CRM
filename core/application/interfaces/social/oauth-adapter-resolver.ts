import type { SocialPlatform } from "@/core/domain/social/social-auth";
import type { PlatformOAuthAdapter } from "./platform-oauth-adapter";

export interface OAuthAdapterResolver {
    getAdapter(platform: SocialPlatform): Promise<PlatformOAuthAdapter>;
}
