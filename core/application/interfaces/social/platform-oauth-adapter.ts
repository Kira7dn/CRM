/**
 * Platform OAuth Adapter
 * Stateless interface for all social platform OAuth flows
 */
export interface PlatformOAuthAdapter {
  /**
   * Build authorization URL for OAuth redirect
   */
  getAuthorizationUrl(state?: string): string;

  /**
   * Exchange OAuth authorization code for access + refresh token
   */
  exchangeCodeForToken?(
    code: string
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    scope?: string;
    providerAccountId: string;   // pageId, channelId, openId...
    raw?: any;
  }>;

  /**
   * Refresh an access token using refresh token
   */
  refreshToken?(
    refreshToken: string
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    raw?: any;
  }>;

  /**
   * Verify if access token is valid
   */
  verifyAccessToken(accessToken: string): Promise<boolean>;

  /**
   * Optional: get profile information using access token
   */
  getProfile?(
    accessToken: string,
    providerAccountId?: string
  ): Promise<any>;

  /**
   * Optional: revoke token
   */
  revokeToken?(
    accessToken: string,
    refreshToken?: string
  ): Promise<boolean>;
}
