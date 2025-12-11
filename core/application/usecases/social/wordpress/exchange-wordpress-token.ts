import { WordPressOAuthGateway } from "@/infrastructure/adapters/external/social/auth/wordpress-oauth-gateway";
import { getWordPressOAuthCredentials } from "@/infrastructure/adapters/external/social/auth/wordpress-oauth-config";
import type { SocialAuthService } from "@/core/application/interfaces/social/social-auth-service";
import { ObjectId } from "mongodb";

/**
 * Exchange WordPress Token Use Case
 * Exchanges Jetpack OAuth authorization code for access token and saves to database
 * Works for both WordPress.com and self-hosted WordPress with Jetpack
 */

export interface ExchangeWordPressTokenRequest {
  code: string; // OAuth authorization code from Jetpack
  userId: string; // User ID to associate with
  pageName?: string; // Optional page/site name override
}

export interface ExchangeWordPressTokenResponse {
  tokenData: {
    access_token: string;
    blog_id: string;
    blog_url: string;
    token_type: string;
    scope: string;
  };
  siteInfo: any;
  savedAuth: any;
}

export class ExchangeWordPressTokenUseCase {
  constructor(private socialAuthService: SocialAuthService) {}

  async execute(request: ExchangeWordPressTokenRequest): Promise<ExchangeWordPressTokenResponse> {
    // Validate inputs
    if (!request.code) {
      throw new Error("Authorization code is required");
    }

    const credentials = getWordPressOAuthCredentials();

    // Create OAuth gateway
    const gateway = new WordPressOAuthGateway(credentials);

    // Exchange code for access token
    // Jetpack returns: access_token, blog_id, blog_url, token_type, scope
    const tokenData = await gateway.exchangeToken(request.code);

    console.log("[ExchangeWordPressToken] Token data received:", {
      blog_id: tokenData.blog_id,
      blog_url: tokenData.blog_url,
      scope: tokenData.scope,
      token_type: tokenData.token_type,
    });

    // Validate that user selected a site
    if (!tokenData.blog_id || tokenData.blog_id === '0' || !tokenData.blog_url) {
      throw new Error(
        "No WordPress site was selected during authorization. " +
        "Please ensure you have a WordPress site connected to your WordPress.com account, " +
        "or install Jetpack on your self-hosted site."
      );
    }

    // Get site information using the access token
    // Note: blog_id might be a numeric ID or a domain, both work with the API
    let siteInfo: any = null;
    try {
      siteInfo = await gateway.getSiteInfo(tokenData.access_token, tokenData.blog_id);
    } catch (err: any) {
      console.warn("[ExchangeWordPressToken] Failed to get site info, using blog_url as fallback:", err.message);
      // If API fails, we can still use blog_url as the site name
      siteInfo = { name: tokenData.blog_url, URL: tokenData.blog_url };
    }

    // Use blog_id as openId (unique identifier for the site)
    const openId = tokenData.blog_id.toString();

    // Use site name from API or fallback to blog_url
    const pageName = request.pageName || siteInfo?.name || tokenData.blog_url;

    // Jetpack tokens don't expire, but set a far future date for consistency
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

    const userId = new ObjectId(request.userId);

    // Check if auth already exists for this site
    const existingAuths = await this.socialAuthService.getByUserAndPlatform(
      userId,
      "wordpress"
    );

    // Find auth for this specific site (blog_id)
    const existingAuth = Array.isArray(existingAuths)
      ? existingAuths.find((auth) => auth.openId === openId)
      : existingAuths?.openId === openId
      ? existingAuths
      : null;

    let savedAuth;

    if (existingAuth) {
      // Update existing auth
      savedAuth = await this.socialAuthService.update({
        id: existingAuth.id,
        platform: "wordpress",
        openId,
        pageName,
        accessToken: tokenData.access_token,
        refreshToken: "", // Jetpack tokens don't use refresh tokens
        expiresAt,
        scope: tokenData.scope,
        userId,
      });
    } else {
      // Create new auth
      savedAuth = await this.socialAuthService.create({
        platform: "wordpress",
        openId,
        pageName,
        accessToken: tokenData.access_token,
        refreshToken: "", // Jetpack tokens don't use refresh tokens
        expiresAt,
        scope: tokenData.scope,
        userId,
      });
    }

    return {
      tokenData,
      siteInfo,
      savedAuth,
    };
  }
}
