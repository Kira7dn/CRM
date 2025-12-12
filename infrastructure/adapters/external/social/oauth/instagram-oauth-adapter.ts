import type { PlatformOAuthAdapter } from "@/core/application/interfaces/social/platform-oauth-adapter";

export interface InstagramOAuthConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
}

export interface InstagramPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
  };
  is_basic_instagram?: boolean;
}

/**
 * Instagram OAuth + API Adapter (stateless)
 * - Không giữ token
 * - Không cache
 * - Tất cả token được truyền từ UseCase
 * - Implement chuẩn PlatformOAuthAdapter
 */
export class InstagramOAuthAdapter implements PlatformOAuthAdapter {
  private readonly baseUrl = "https://graph.facebook.com/v23.0";

  constructor(private readonly config: InstagramOAuthConfig) { }

  /** IG dùng FB OAuth */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.appId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      scope: [
        "instagram_basic",
        "pages_show_list",
        "pages_read_engagement",
        "pages_manage_metadata",
        "instagram_manage_comments",
        "instagram_manage_messages",
        "instagram_content_publish",
        "business_management", // Required to access Business Portfolio pages
      ].join(","),
    });

    if (state) params.set("state", state);

    return `https://www.facebook.com/v23.0/dialog/oauth?${params.toString()}`;
  }

  /** Step 1 — exchange code → long-lived user token + pages + business accounts */
  async exchangeCodeForToken(code: string) {
    if (!this.config.appId || !this.config.appSecret) {
      throw new Error("Instagram configuration missing");
    }

    // Step 1: Exchange code for access token (using v23.0 to match working code)
    const tokenURL = new URL("https://graph.facebook.com/v23.0/oauth/access_token");
    tokenURL.searchParams.set("client_id", this.config.appId);
    tokenURL.searchParams.set("redirect_uri", this.config.redirectUri);
    tokenURL.searchParams.set("client_secret", this.config.appSecret);
    tokenURL.searchParams.set("code", code);

    const response = await fetch(tokenURL.toString());
    const text = await response.text();

    if (!text) {
      throw new Error("Empty response from OAuth");
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error("Invalid JSON from OAuth");
    }

    if (!response.ok || data.error) {
      throw new Error(data.error?.message || "Token exchange failed");
    }

    const userToken = data.access_token;

    // Step 2: Fetch Facebook Pages linked to the user (using v23.0 to match working code)
    // DEBUG: Log the user token to verify it's valid
    console.log("[Instagram OAuth] User token (first 20 chars):", userToken.substring(0, 20) + "...");

    // MUST include instagram_business_account in fields to get IG data
    const pagesURL = `https://graph.facebook.com/v23.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${userToken}`;

    console.log("[Instagram OAuth] Fetching pages from URL:", pagesURL.replace(userToken, "TOKEN_HIDDEN"));

    const pagesResponse = await fetch(pagesURL);
    const pagesData = await pagesResponse.json();

    console.log("[Instagram OAuth] Pages API response:", {
      status: pagesResponse.status,
      ok: pagesResponse.ok,
      hasData: !!pagesData.data,
      dataLength: pagesData.data?.length || 0,
      error: pagesData.error,
      allPages: pagesData.data?.map((p: any) => ({
        id: p.id,
        name: p.name,
        hasIG: !!p.instagram_business_account,
        igId: p.instagram_business_account?.id,
        tasks: p.tasks // Show what permissions user has on this page
      })),
      fullResponse: pagesData // Debug entire response structure
    });

    // Also try basic endpoint to see if user has any pages at all
    try {
      const basicPagesURL = `https://graph.facebook.com/v23.0/me/accounts?access_token=${userToken}`;
      const basicResponse = await fetch(basicPagesURL);
      const basicData = await basicResponse.json();

      console.log("[Instagram OAuth] Basic pages API response:", {
        status: basicResponse.status,
        ok: basicResponse.ok,
        hasData: !!basicData.data,
        dataLength: basicData.data?.length || 0,
        error: basicData.error,
        fullResponse: basicData
      });

      // Check token permissions
      try {
        const permissionsURL = `https://graph.facebook.com/v23.0/me/permissions?access_token=${userToken}`;
        const permissionsResponse = await fetch(permissionsURL);
        const permissionsData = await permissionsResponse.json();

        console.log("[Instagram OAuth] Token permissions:", {
          status: permissionsResponse.status,
          ok: permissionsResponse.ok,
          permissions: permissionsData.data,
          fullPermissions: permissionsData
        });

        // Also check user info to see if this is a test user or real user
        const meURL = `https://graph.facebook.com/v23.0/me?fields=id,name&access_token=${userToken}`;
        const meResponse = await fetch(meURL);
        const meData = await meResponse.json();

        console.log("[Instagram OAuth] User info:", {
          id: meData.id,
          name: meData.name,
          is_verified: meData.is_verified,
          link: meData.link,
          fullData: meData
        });

        // Check if user can manage any pages at all (debug endpoint)
        const debugURL = `https://graph.facebook.com/v23.0/me?fields=id,name,accounts{id,name,access_token,instagram_business_account}&access_token=${userToken}`;
        const debugResponse = await fetch(debugURL);
        const debugData = await debugResponse.json();

        console.log("[Instagram OAuth] Debug /me with accounts field:", {
          status: debugResponse.status,
          ok: debugResponse.ok,
          hasAccounts: !!debugData.accounts,
          accountsCount: debugData.accounts?.data?.length || 0,
          fullData: debugData
        });

        // Also check Business Manager pages (pages managed via Business Manager)
        const businessPagesURL = `https://graph.facebook.com/v23.0/me/businesses?fields=id,name,owned_pages{id,name,instagram_business_account},client_pages{id,name,instagram_business_account}&access_token=${userToken}`;
        const businessResponse = await fetch(businessPagesURL);
        const businessData = await businessResponse.json();

        console.log("[Instagram OAuth] Business Manager pages:", {
          status: businessResponse.status,
          ok: businessResponse.ok,
          hasBusinesses: !!businessData.data,
          businessCount: businessData.data?.length || 0,
          fullData: businessData
        });

      } catch (permError) {
        console.error("[Instagram OAuth] Error checking permissions:", permError);
      }
    } catch (error) {
      console.error("[Instagram OAuth] Error fetching basic pages:", error);
    }

    // Step 3: Filter pages with IG Business linked
    let pagesWithIG: InstagramPage[] = [];

    if (pagesData.data && pagesData.data.length > 0) {
      console.log("[Instagram OAuth] All pages before filter:", pagesData.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        hasIG: !!p.instagram_business_account,
        igId: p.instagram_business_account?.id
      })));

      pagesWithIG = pagesData.data.filter(
        (p: any) => p.instagram_business_account
      );
    }

    // If no pages with Instagram found, create a basic connection with user info
    if (pagesWithIG.length === 0) {
      console.log("[Instagram OAuth] No pages with Instagram accounts found, fetching user info for basic connection")

      try {
        // Get user info from Facebook Graph API
        const userResponse = await fetch(
          `${this.baseUrl}/me?fields=id,name&access_token=${userToken}`
        );
        const userData = await userResponse.json();

        console.log("[Instagram OAuth] User data:", {
          hasData: !!userData,
          userId: userData.id,
          userName: userData.name
        })

        pagesWithIG = [{
          id: userData.id || "instagram_user",
          name: `Instagram Connection (${userData.name || "User"})`,
          access_token: userToken,
          is_basic_instagram: true
        }];
      } catch (error) {
        console.error("[Instagram OAuth] Error fetching user info:", error);
        // Fallback to generic connection
        pagesWithIG = [{
          id: "instagram_user",
          name: "Instagram Connection",
          access_token: userToken,
          is_basic_instagram: true
        }];
      }
    }

    console.log("[Instagram OAuth] Final pages count:", pagesWithIG.length);

    return {
      accessToken: userToken,
      refreshToken: userToken, // Use access token as refresh token for IG
      providerAccountId: pagesWithIG[0]?.instagram_business_account?.id || pagesWithIG[0]?.id || "instagram_user",
      expiresIn: 5184000, // 60 days default
      scope: [
        "instagram_basic",
        "pages_show_list",
        "pages_read_engagement",
        "pages_manage_metadata",
        "instagram_manage_comments",
        "instagram_manage_messages",
        "instagram_content_publish",
      ].join(","),
      raw: {
        user_token: userToken,
        pages: pagesWithIG,
        instagram_business_account_id: pagesWithIG[0]?.instagram_business_account?.id,
        // Include error info for callback route to handle
        hasPages: pagesData.data && pagesData.data.length > 0,
        hasInstagramAccounts: pagesWithIG.length > 0 && !pagesWithIG[0]?.is_basic_instagram
      },
    };
  }

  /** IG uses FB refresh mechanism */
  async refreshToken(accessToken: string) {
    const params = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: this.config.appId,
      client_secret: this.config.appSecret,
      fb_exchange_token: accessToken,
    });

    const res = await fetch(
      `${this.baseUrl}/oauth/access_token?${params.toString()}`
    );
    const raw = await res.json();

    if (!res.ok || raw.error) throw new Error(raw.error?.message);

    return {
      accessToken: raw.access_token,
      refreshToken: undefined,
      expiresIn: raw.expires_in ?? 5184000,
      raw,
    };
  }

  /** verify token validity */
  async verifyAccessToken(
    accessToken: string,
    igBusinessId?: string
  ): Promise<boolean> {
    if (!igBusinessId) return false;

    const params = new URLSearchParams({
      fields: "id,username",
      access_token: accessToken,
    });

    const res = await fetch(
      `${this.baseUrl}/${igBusinessId}?${params.toString()}`
    );
    const raw = await res.json();

    return !raw.error;
  }

  /** get IG Business profile */
  async getProfile(accessToken: string, igBusinessId?: string) {
    if (!igBusinessId) return null;

    const params = new URLSearchParams({
      fields: "id,username,name,profile_picture_url",
      access_token: accessToken,
    });

    const res = await fetch(
      `${this.baseUrl}/${igBusinessId}?${params.toString()}`
    );
    const raw = await res.json();

    if (raw.error) return null;
    return raw;
  }

  /** optional revoke */
  async revokeToken(accessToken: string): Promise<boolean> {
    const params = new URLSearchParams({ access_token: accessToken });

    const res = await fetch(
      `${this.baseUrl}/me/permissions?${params.toString()}`,
      { method: "DELETE" }
    );
    const raw = await res.json();

    return !!raw.success;
  }
}
