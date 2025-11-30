/**
 * Token Refresh Helper Functions
 * Provides standalone functions for token refresh operations
 */

/**
 * Refresh YouTube access token
 */
export async function refreshYouTubeToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
  scope: string;
} | null> {
  try {
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Missing YouTube client configuration");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("Failed to refresh YouTube token:", data.error);
      return null;
    }

    return {
      access_token: data.access_token,
      expires_in: data.expires_in || 3600,
      scope: data.scope || "",
    };
  } catch (error) {
    console.error("Error refreshing YouTube token:", error);
    return null;
  }
}

/**
 * Refresh TikTok access token
 */
export async function refreshTikTokToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  open_id: string;
  scope: string;
} | null> {
  try {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

    if (!clientKey || !clientSecret) {
      throw new Error("Missing TikTok client configuration");
    }

    const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }).toString(),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("Failed to refresh TikTok token:", data.error);
      return null;
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      open_id: data.open_id,
      scope: data.scope,
    };
  } catch (error) {
    console.error("Error refreshing TikTok token:", error);
    return null;
  }
}

/**
 * Refresh Facebook long-lived token
 */
export async function refreshFacebookToken(currentToken: string): Promise<{
  access_token: string;
  expires_in: number;
} | null> {
  try {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appId || !appSecret) {
      throw new Error("Missing Facebook client configuration");
    }

    const params = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: currentToken,
    });

    const response = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("Failed to refresh Facebook token:", data.error);
      return null;
    }

    return {
      access_token: data.access_token,
      expires_in: data.expires_in || 5184000, // 60 days default
    };
  } catch (error) {
    console.error("Error refreshing Facebook token:", error);
    return null;
  }
}
