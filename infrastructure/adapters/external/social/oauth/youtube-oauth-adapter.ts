import type { PlatformOAuthAdapter } from "@/core/application/interfaces/social/platform-oauth-adapter";

export interface YouTubeOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export class YouTubeOAuthAdapter implements PlatformOAuthAdapter {
  private readonly tokenUrl = "https://oauth2.googleapis.com/token";
  private readonly apiBase = "https://www.googleapis.com/youtube/v3";

  constructor(private readonly cfg: YouTubeOAuthConfig) { }

  /**
   * Authorization URL for YouTube OAuth2
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.cfg.clientId,
      redirect_uri: this.cfg.redirectUri,
      response_type: "code",
      access_type: "offline", // ensures refresh token
      prompt: "consent",      // ensures refresh token always returned
      scope: [
        "openid",
        "profile",
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/youtube.upload",
        "https://www.googleapis.com/auth/youtube.force-ssl",
      ].join(" "),
    });

    if (state) params.set("state", state);

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange code for access + refresh token + channel info
   */
  async exchangeCodeForToken(code: string) {
    if (!this.cfg.clientId || !this.cfg.clientSecret) {
      throw new Error("YouTube configuration missing");
    }

    // Step 1: Exchange code for tokens
    const body = new URLSearchParams({
      client_id: this.cfg.clientId,
      client_secret: this.cfg.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: this.cfg.redirectUri,
    });

    const res = await fetch(this.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const raw = await res.json();

    if (!res.ok || raw.error) {
      throw new Error(raw.error_description || raw.error || "YouTube token exchange failed");
    }

    // Step 2: Fetch YouTube channel information
    const channelInfoResponse = await fetch(
      `${this.apiBase}/channels?part=snippet&mine=true`,
      {
        headers: { Authorization: `Bearer ${raw.access_token}` },
      }
    );

    if (!channelInfoResponse.ok) {
      const errorText = await channelInfoResponse.text();
      throw new Error(`Failed to fetch channel info: ${errorText}`);
    }

    const channelInfo = await channelInfoResponse.json();

    // Extract channel ID and name from items[0]
    if (!channelInfo.items || channelInfo.items.length === 0) {
      throw new Error("No YouTube channel found for this account");
    }

    const channelId = channelInfo.items[0].id;
    const channelName = channelInfo.items[0].snippet.title;

    if (!channelId || !channelName) {
      throw new Error(`Invalid channel data. Response: ${JSON.stringify(channelInfo.items[0])}`);
    }

    return {
      accessToken: raw.access_token,
      refreshToken: raw.refresh_token, // may be missing if user connected before
      expiresIn: raw.expires_in || 3600,
      scope: raw.scope || "",
      providerAccountId: channelId, // Use channel ID as provider account ID
      raw: {
        ...raw,
        channel_id: channelId,
        channel_name: channelName,
      },
    };
  }

  /**
   * Refresh token using refresh_token
   */
  async refreshToken(refreshToken: string) {
    const body = new URLSearchParams({
      client_id: this.cfg.clientId,
      client_secret: this.cfg.clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    const res = await fetch(this.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const raw = await res.json();

    if (!res.ok || raw.error) {
      throw new Error(raw.error_description || raw.error || "YouTube refresh token failed");
    }

    return {
      accessToken: raw.access_token,
      refreshToken: raw.refresh_token ?? refreshToken, // Google may NOT return refresh_token
      expiresIn: raw.expires_in,
      raw,
    };
  }

  /**
   * Verify access token by calling channels.list?mine=true
   */
  async verifyAccessToken(accessToken: string): Promise<boolean> {
    const params = new URLSearchParams({
      part: "snippet",
      mine: "true",
    });

    const res = await fetch(`${this.apiBase}/channels?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const raw = await res.json();

    return !raw.error;
  }

  /**
   * Get YouTube channel profile
   */
  async getProfile(accessToken: string) {
    const params = new URLSearchParams({
      part: "snippet",
      mine: "true",
    });

    const res = await fetch(`${this.apiBase}/channels?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const raw = await res.json();
    if (raw.error) return null;

    return {
      channelId: raw.items?.[0]?.id,
      title: raw.items?.[0]?.snippet?.title,
      avatar: raw.items?.[0]?.snippet?.thumbnails?.default?.url,
    };
  }

  /**
   * Google does NOT support revoke via API in a stable way → return false
   */
  async revokeToken(): Promise<boolean> {
    return false;
  }
}
