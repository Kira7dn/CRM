/**
 * Platform Authentication Service Interface
 * Application layer interface for authentication services
 */

export interface PlatformAuthConfig {
  accessToken: string;
  pageId?: string;
  expiresAt?: Date;
}

/**
 * Platform Authentication Service
 * Defines contract for platform authentication
 */
export interface PlatformAuthService {
  /**
   * Get current access token
   */
  getAccessToken(): string;

  /**
   * Get platform-specific ID (page ID, channel ID, OA ID)
   */
  getPageId(): string;

  /**
   * Verify authentication is valid
   */
  verifyAuth(): Promise<boolean>;

  /**
   * Check if token is expired
   */
  isExpired(): boolean;

  /**
   * Refresh access token
   * @returns new access token and expiration time
   */
  refreshToken?(): Promise<{ accessToken: string; expiresIn: number }>;
}
