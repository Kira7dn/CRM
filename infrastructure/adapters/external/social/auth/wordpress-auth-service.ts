import axios from "axios";
import { BasePlatformAuthService } from "./base-auth-service";
import type { PlatformAuthConfig } from "@/core/application/interfaces/social/auth-service";
import { WordPressOAuthGateway } from "./wordpress-oauth-gateway";

export interface WordPressPlatformConfig extends PlatformAuthConfig {
  siteUrl?: string; // WordPress site URL (blog_url from Jetpack)
  blogId?: string; // WordPress.com blog ID (unique identifier)
}

/**
 * WordPress Authentication Service using Jetpack OAuth
 * Works for both WordPress.com and self-hosted WordPress with Jetpack
 */
export class WordPressAuthService extends BasePlatformAuthService {
  private oauth: WordPressOAuthGateway;

  constructor(protected config: WordPressPlatformConfig) {
    super(config);
    this.oauth = new WordPressOAuthGateway({
      clientId: process.env.WP_CLIENT_ID!,
      clientSecret: process.env.WP_CLIENT_SECRET!,
      redirectUri: process.env.WP_REDIRECT_URI!,
      siteUrl: config.siteUrl,
      blogId: config.blogId,
    });
  }

  /**
   * Get WordPress OAuth authorization URL
   * @param state Optional state parameter for CSRF protection
   * @returns Authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    return this.oauth.getAuthorizationUrl(state);
  }

  /**
   * Verify if authentication is valid by calling WordPress API
   * Uses Jetpack API endpoint (works for both .com and self-hosted)
   * @returns true if authentication is valid, false otherwise
   */
  async verifyAuth(): Promise<boolean> {
    try {
      if (!this.config.blogId) {
        this.log("No blog ID available for verification");
        return false;
      }

      // Use Jetpack API to verify access
      const url = `https://public-api.wordpress.com/rest/v1.1/sites/${this.config.blogId}`;
      await axios.get(url, {
        headers: { Authorization: `Bearer ${this.getAccessToken()}` },
      });
      return true;
    } catch (err: any) {
      this.logError("verifyAuth failed", err);
      return false;
    }
  }

  /**
   * Refresh access token
   * Note: Jetpack OAuth tokens don't expire, so this always returns null
   * @returns null (Jetpack tokens are permanent)
   */
  async refreshToken(): Promise<{ accessToken: string; expiresIn: number } | null> {
    this.log("Jetpack OAuth tokens do not expire and cannot be refreshed");
    return null;
  }

  /**
   * Get WordPress site information via Jetpack API
   * Works for both WordPress.com and self-hosted sites
   * @returns Site info or null if failed
   */
  async getSiteInfo(): Promise<any> {
    try {
      if (!this.config.blogId) {
        this.log("No blog ID available");
        return null;
      }

      return await this.oauth.getSiteInfo(this.getAccessToken(), this.config.blogId);
    } catch (err: any) {
      this.logError("getSiteInfo failed", err);
      return null;
    }
  }

  /**
   * Get WordPress authentication data for posting adapter
   * @returns WordPress auth data
   */
  getAuthData() {
    // Determine token type based on available data
    const isWpCom = !!this.config.blogId && !this.config.siteUrl?.includes('wp-json');

    return {
      accessToken: this.getAccessToken(),
      tokenType: isWpCom ? "wpcom" as const : "self-host" as const,
      siteUrl: this.config.siteUrl,
      siteId: this.config.blogId,
    };
  }
}

/**
 * Create WordPress auth service for user
 */
export async function createWordPressAuthServiceForUser(userId: string): Promise<WordPressAuthService> {
  // Import here to avoid circular dependencies
  const { SocialAuthRepository } = await import("@/infrastructure/repositories/social/social-auth-repo");
  const { ObjectId } = await import("mongodb");

  const repo = new SocialAuthRepository();
  const authData = await repo.getByUserAndPlatform(new ObjectId(userId), "wordpress" as any);
  if (!authData) {
    throw new Error(`No WordPress authentication found for user ${userId}`);
  }

  return new WordPressAuthService({
    accessToken: authData.accessToken,
    expiresAt: authData.expiresAt,
    siteUrl: authData.pageName, // Using pageName to store site URL for WordPress
    blogId: authData.openId, // Using openId to store blog ID for WordPress
  });
}
