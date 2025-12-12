import type { PlatformOAuthAdapter } from "@/core/application/interfaces/social/platform-oauth-adapter";

export interface TikTokOAuthConfig {
  clientKey: string;
  clientSecret: string;
  redirectUri: string;
}

export class TikTokOAuthAdapter implements PlatformOAuthAdapter {
  private readonly baseUrl = "https://open.tiktokapis.com";

  constructor(private readonly cfg: TikTokOAuthConfig) { }

  /** OAuth redirect URL */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_key: this.cfg.clientKey,
      redirect_uri: this.cfg.redirectUri,
      response_type: "code",
      scope: [
        "user.info.basic",
        "video.list",
        "video.upload",
      ].join(","),
    });

    if (state) params.set("state", state);

    return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
  }

  /** Exchange code → access + refresh token */
  async exchangeCodeForToken(code: string) {
    const url = `${this.baseUrl}/v2/oauth/token/`;

    const body = new URLSearchParams({
      client_key: this.cfg.clientKey,
      client_secret: this.cfg.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: this.cfg.redirectUri,
    });

    console.log('[TikTok OAuth] Token exchange request:', {
      url,
      redirectUri: this.cfg.redirectUri,
      hasCode: !!code,
      hasClientKey: !!this.cfg.clientKey,
      hasClientSecret: !!this.cfg.clientSecret,
    });

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const raw = await res.json();

    console.log('[TikTok OAuth] Token exchange response:', {
      status: res.status,
      ok: res.ok,
      errorCode: raw.error_code,
      error: raw.error,
      message: raw.message,
      description: raw.description,
      hasAccessToken: !!raw.access_token,
      hasData: !!raw.data,
    });

    // TikTok API v2 returns data directly (not wrapped in `data` object)
    // Error response has `error`, `message`, or `error_code` fields
    if (raw.error || raw.message || (raw.error_code && raw.error_code !== 0)) {
      const errorMsg = `TikTok code exchange failed: ${raw.error || raw.message || raw.description || 'Unknown error'}`;
      console.error('[TikTok OAuth] Error details:', raw);
      throw new Error(errorMsg);
    }

    // Success response structure (direct fields, no `data` wrapper)
    if (!raw.access_token || !raw.open_id) {
      console.error('[TikTok OAuth] Missing required fields in response:', raw);
      throw new Error('TikTok response missing access_token or open_id');
    }

    // Fetch user profile to get display_name (pageName)
    const profile = await this.getProfile(raw.access_token);
    const pageName = profile?.display_name || '';

    console.log('[TikTok OAuth] User profile fetched:', {
      hasProfile: !!profile,
      displayName: pageName,
    });

    return {
      accessToken: raw.access_token,
      refreshToken: raw.refresh_token,
      expiresIn: raw.expires_in,
      providerAccountId: raw.open_id,
      scope: raw.scope,
      raw: {
        ...raw,
        pageName, // Add pageName for ConnectSocialAccountUseCase
      },
    };
  }

  /** Refresh access token */
  async refreshToken(refreshToken: string) {
    const url = `${this.baseUrl}/v2/oauth/token/`;

    const body = new URLSearchParams({
      client_key: this.cfg.clientKey,
      client_secret: this.cfg.clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const raw = await res.json();

    // TikTok API v2 returns data directly (not wrapped in `data` object)
    if (raw.error || raw.message || (raw.error_code && raw.error_code !== 0)) {
      throw new Error(raw.error || raw.message || raw.description || "TikTok refresh token failed");
    }

    if (!raw.access_token) {
      throw new Error('TikTok refresh response missing access_token');
    }

    return {
      accessToken: raw.access_token,
      refreshToken: raw.refresh_token,
      expiresIn: raw.expires_in,
      raw,
    };
  }

  /** Validate access token by fetching user info */
  async verifyAccessToken(accessToken: string): Promise<boolean> {
    const url = `${this.baseUrl}/v2/user/info/?fields=open_id,display_name`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const raw = await res.json();
    // Success: error.code === 'ok'
    return raw.error?.code === 'ok' && !!raw.data?.user;
  }

  /** Get TikTok user profile */
  async getProfile(accessToken: string) {
    const url = `${this.baseUrl}/v2/user/info/?fields=open_id,avatar_url,display_name`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const raw = await res.json();

    // TikTok API v2 returns data with error object
    // Success: { data: { user: {...} }, error: { code: 'ok', message: '' } }
    // Error: { error: { code: 'error_code', message: 'Error description' } }
    if (raw.error?.code && raw.error.code !== 'ok') {
      console.error('[TikTok OAuth] getProfile error:', raw);
      return null;
    }

    // Success response has `data.user` object
    return raw.data?.user || null;
  }

  /** Revoke token (TikTok does NOT support revoke via API → return false) */
  async revokeToken(): Promise<boolean> {
    return false;
  }
}
