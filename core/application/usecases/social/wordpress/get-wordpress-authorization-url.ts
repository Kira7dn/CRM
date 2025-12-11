import { WordPressOAuthGateway } from "@/infrastructure/adapters/external/social/auth/wordpress-oauth-gateway";
import { getWordPressOAuthCredentials } from "@/infrastructure/adapters/external/social/auth/wordpress-oauth-config";

/**
 * Get WordPress Authorization URL Use Case
 * Generates Jetpack OAuth authorization URL for any WordPress site
 * Works for both WordPress.com and self-hosted WordPress with Jetpack
 */

export interface GetWordPressAuthorizationUrlRequest {
  siteUrl?: string; // WordPress site URL (optional, for reference)
  blogId?: string; // WordPress.com blog ID (optional, to pre-select site)
  state?: string; // Optional state parameter for CSRF protection
}

export interface GetWordPressAuthorizationUrlResponse {
  authorizationUrl: string;
}

export class GetWordPressAuthorizationUrlUseCase {
  execute(request: GetWordPressAuthorizationUrlRequest): GetWordPressAuthorizationUrlResponse {
    const credentials = getWordPressOAuthCredentials();

    const gateway = new WordPressOAuthGateway({
      ...credentials,
      siteUrl: request.siteUrl,
      blogId: request.blogId,
    });

    const authorizationUrl = gateway.getAuthorizationUrl(request.state);

    return { authorizationUrl };
  }
}
