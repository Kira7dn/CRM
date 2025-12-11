/**
 * WordPress OAuth Configuration Helper
 * Determines correct redirect URI based on environment
 */

/**
 * Get base app URL for redirects
 * Priority: APP_URL > NGROK_TUNNEL > NEXT_PUBLIC_APP_URL > localhost
 */
export function getAppUrl(): string {
  return (
    process.env.APP_URL ||
    process.env.NGROK_TUNNEL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}

/**
 * Get the correct WordPress redirect URI
 * Uses APP_URL/NGROK_TUNNEL if available, otherwise uses WP_REDIRECT_URI
 */
export function getWordPressRedirectUri(): string {
  // If WP_REDIRECT_URI is explicitly set, use it
  if (process.env.WP_REDIRECT_URI) {
    return process.env.WP_REDIRECT_URI;
  }

  // Otherwise construct from app URL
  const appUrl = getAppUrl();
  return `${appUrl}/api/auth/wordpress/callback`;
}

/**
 * Get WordPress OAuth credentials from environment
 */
export function getWordPressOAuthCredentials() {
  return {
    clientId: process.env.WP_CLIENT_ID || "",
    clientSecret: process.env.WP_CLIENT_SECRET || "",
    redirectUri: getWordPressRedirectUri(),
  };
}
