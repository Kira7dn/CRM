/**
 * Detect WordPress Type Use Case
 * Determines if a site is WordPress.com, self-hosted with OAuth, self-hosted without OAuth, or not WordPress
 */

export interface DetectWordPressTypeRequest {
  siteUrl: string;
}

export interface DetectWordPressTypeResponse {
  type: "wpcom" | "self-host-oauth" | "self-host-no-oauth" | "not-wordpress";
  siteUrl: string;
}

export class DetectWordPressTypeUseCase {
  async execute(request: DetectWordPressTypeRequest): Promise<DetectWordPressTypeResponse> {
    const clean = request.siteUrl.replace(/\/$/, "");

    try {
      // 1. Check if site has WordPress REST API
      const restResponse = await fetch(`${clean}/wp-json/`, { method: "HEAD" });
      if (!restResponse.ok) {
        return {
          type: "not-wordpress",
          siteUrl: clean,
        };
      }

      // 2. Check if it's WordPress.com by checking for wpcom-specific endpoints
      try {
        const wpcomResponse = await fetch(`${clean}/wp-json/wpcom/v2/sites`, { method: "HEAD" });
        if (wpcomResponse.ok) {
          return {
            type: "wpcom",
            siteUrl: clean,
          };
        }
      } catch (err) {
        // Not WP.com, continue checking
      }

      // 3. Check for OAuth plugin presence (/oauth/authorize)
      try {
        const authResponse = await fetch(`${clean}/oauth/authorize`, { method: "HEAD" });
        // OAuth endpoint exists if we get 200, 302 (redirect), or 401 (needs auth)
        if (authResponse.ok || authResponse.status === 302 || authResponse.status === 401) {
          return {
            type: "self-host-oauth",
            siteUrl: clean,
          };
        }
      } catch (err) {
        // OAuth plugin not installed
      }

      // 4. Self-hosted WordPress without OAuth plugin
      return {
        type: "self-host-no-oauth",
        siteUrl: clean,
      };
    } catch (err) {
      console.error("[DetectWordPressTypeUseCase] Error detecting WordPress type:", err);
      return {
        type: "not-wordpress",
        siteUrl: clean,
      };
    }
  }
}
