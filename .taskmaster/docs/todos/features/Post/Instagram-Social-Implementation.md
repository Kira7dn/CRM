# Instagram Social Media Integration - Implementation Guide

## Overview
Implement Instagram OAuth authentication and posting capabilities following the existing Facebook/TikTok pattern in the CRM system.

## Environment Variables Required

Add to `.env.local`:
```env
# Instagram Integration (Facebook Graph API)
INSTAGRAM_APP_ID=your_facebook_app_id
INSTAGRAM_APP_SECRET=your_facebook_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/auth/instagram/callback
```

**Note**: Instagram uses Facebook's Graph API, so you'll need a Facebook App with Instagram Basic Display or Instagram Graph API permissions.

## Implementation Checklist

### 1. Instagram Auth Service
**File**: `infrastructure/adapters/external/social/auth/instagram-auth-service.ts`

```typescript
import { BasePlatformOAuthService } from "./base-auth-service";
import type { PlatformAuthConfig } from "@/core/application/interfaces/social/auth-service";

export interface InstagramAuthConfig extends PlatformAuthConfig {
  appId: string;
  appSecret: string;
  instagramBusinessAccountId?: string;
}

export class InstagramAuthService extends BasePlatformOAuthService {
  protected baseUrl = "https://graph.facebook.com/v19.0";
  private _cachedAccessToken: string | null = null;
  private _tokenExpireTime: number | null = null;

  constructor(private igConfig: InstagramAuthConfig) {
    super(igConfig);
  }

  async verifyAuth(): Promise<boolean> {
    // Verify Instagram account is still connected
    // GET /me?fields=id,username&access_token={token}
  }

  async refreshToken(): Promise<{ accessToken: string; expiresIn: number }> {
    // Exchange short-lived token for long-lived token
    // GET /oauth/access_token?grant_type=ig_exchange_token
  }

  async getInstagramBusinessAccount(): Promise<string> {
    // Get Instagram Business Account ID from Page ID
    // GET /{page-id}?fields=instagram_business_account
  }
}

export async function createInstagramAuthServiceForUser(userId: string): Promise<InstagramAuthService> {
  // Factory to create service from user's stored credentials
}

export async function createInstagramAuthServiceForChannel(channelId: string): Promise<InstagramAuthService> {
  // Factory to create service from channel ID (Instagram Business Account ID)
}
```

### 2. Instagram Posting Adapter
**File**: `infrastructure/adapters/external/social/posting/instagram-posting-adapter.ts`

```typescript
import type { PostMetrics, PostMedia } from "@/core/domain/marketing/post";
import type { InstagramAuthService } from "../auth/instagram-auth-service";
import { BasePostingAdapter } from "./base-posting-service";
import type { PostingPublishRequest, PostingPublishResponse } from "@/core/application/interfaces/social/posting-adapter";

export class InstagramPostingAdapter extends BasePostingAdapter {
  platform = "instagram" as const;
  private baseUrl = "https://graph.facebook.com/v19.0";

  constructor(private auth: InstagramAuthService) {
    super();
  }

  async publish(request: PostingPublishRequest): Promise<PostingPublishResponse> {
    // Instagram requires 2-step process:
    // 1. Create media container: POST /{ig-user-id}/media
    // 2. Publish container: POST /{ig-user-id}/media_publish

    if (request.media.length === 0) {
      return { success: false, error: "Instagram requires at least one image or video" };
    }

    const mediaType = request.media[0].type;
    if (mediaType === "image") {
      return await this.publishPhoto(request);
    } else if (mediaType === "video") {
      return await this.publishVideo(request);
    } else {
      return await this.publishCarousel(request);
    }
  }

  async update(postId: string, request: PostingPublishRequest): Promise<PostingPublishResponse> {
    // Instagram doesn't support editing posts
    return { success: false, error: "Instagram does not support post editing" };
  }

  async delete(postId: string): Promise<boolean> {
    // DELETE /{ig-media-id}
  }

  async getMetrics(postId: string): Promise<PostMetrics> {
    // GET /{ig-media-id}?fields=like_count,comments_count,engagement,impressions,reach
  }

  private async publishPhoto(request: PostingPublishRequest): Promise<PostingPublishResponse> {
    // Step 1: Create media container
    // POST /{ig-user-id}/media with image_url and caption
    // Step 2: Publish
    // POST /{ig-user-id}/media_publish with creation_id
  }

  private async publishVideo(request: PostingPublishRequest): Promise<PostingPublishResponse> {
    // Step 1: Create video container
    // POST /{ig-user-id}/media with media_type=VIDEO, video_url and caption
    // Step 2: Wait for video processing
    // GET /{container-id}?fields=status_code
    // Step 3: Publish when ready
    // POST /{ig-user-id}/media_publish
  }

  private async publishCarousel(request: PostingPublishRequest): Promise<PostingPublishResponse> {
    // Step 1: Create child media containers for each item
    // Step 2: Create carousel container with children
    // POST /{ig-user-id}/media with media_type=CAROUSEL
    // Step 3: Publish carousel
  }

  async verifyAuth(): Promise<boolean> {
    return await this.auth.verifyAuth();
  }
}
```

### 3. Use Cases
**Directory**: `core/application/usecases/social/instagram/`

Create 4 use case files following the pattern from Facebook:

#### save-instagram-token.ts
```typescript
import type { SocialAuthService } from "@/core/application/interfaces/social/social-auth-service";
import type { ObjectId } from "mongodb";

export interface SaveInstagramTokenRequest {
  userId: ObjectId;
  accessToken: string;
  expiresIn: number;
  instagramBusinessAccountId: string;
  username: string;
}

export interface SaveInstagramTokenResponse {
  success: boolean;
  channelId?: string;
}

export class SaveInstagramTokenUseCase {
  constructor(private socialAuthService: SocialAuthService) {}

  async execute(request: SaveInstagramTokenRequest): Promise<SaveInstagramTokenResponse> {
    const expiresAt = new Date(Date.now() + request.expiresIn * 1000);

    const auth = await this.socialAuthService.save({
      userId: request.userId,
      platform: "instagram",
      accessToken: request.accessToken,
      refreshToken: "", // Instagram doesn't use refresh tokens
      expiresAt,
      openId: request.instagramBusinessAccountId,
      channelId: request.instagramBusinessAccountId,
      channelName: request.username,
      scopes: ["instagram_basic", "instagram_content_publish"],
    });

    return {
      success: true,
      channelId: auth.channelId,
    };
  }
}
```

#### get-instagram-auth.ts
```typescript
import type { SocialAuthService } from "@/core/application/interfaces/social/social-auth-service";
import type { SocialAuth } from "@/core/domain/marketing/social-auth";
import type { ObjectId } from "mongodb";

export interface GetInstagramAuthRequest {
  userId: ObjectId;
}

export interface GetInstagramAuthResponse {
  auth: SocialAuth | null;
}

export class GetInstagramAuthUseCase {
  constructor(private socialAuthService: SocialAuthService) {}

  async execute(request: GetInstagramAuthRequest): Promise<GetInstagramAuthResponse> {
    const auth = await this.socialAuthService.getByUserAndPlatform(
      request.userId,
      "instagram"
    );
    return { auth };
  }
}
```

#### refresh-instagram-token.ts
```typescript
import type { SocialAuthService } from "@/core/application/interfaces/social/social-auth-service";
import type { ObjectId } from "mongodb";

export interface RefreshInstagramTokenRequest {
  userId: ObjectId;
}

export interface RefreshInstagramTokenResponse {
  success: boolean;
  accessToken?: string;
  expiresAt?: Date;
}

export class RefreshInstagramTokenUseCase {
  constructor(private socialAuthService: SocialAuthService) {}

  async execute(request: RefreshInstagramTokenRequest): Promise<RefreshInstagramTokenResponse> {
    const auth = await this.socialAuthService.getByUserAndPlatform(
      request.userId,
      "instagram"
    );

    if (!auth) {
      return { success: false };
    }

    // Call Instagram Graph API to refresh long-lived token
    // GET /refresh_access_token?grant_type=ig_refresh_token&access_token={token}
    const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${auth.accessToken}`;

    const response = await fetch(refreshUrl);
    const data = await response.json();

    if (!response.ok || data.error) {
      return { success: false };
    }

    const expiresAt = new Date(Date.now() + (data.expires_in * 1000));

    await this.socialAuthService.update({
      _id: auth._id,
      accessToken: data.access_token,
      expiresAt,
    });

    return {
      success: true,
      accessToken: data.access_token,
      expiresAt,
    };
  }
}
```

#### disconnect-instagram.ts
```typescript
import type { SocialAuthService } from "@/core/application/interfaces/social/social-auth-service";
import type { ObjectId } from "mongodb";

export interface DisconnectInstagramRequest {
  userId: ObjectId;
}

export interface DisconnectInstagramResponse {
  success: boolean;
}

export class DisconnectInstagramUseCase {
  constructor(private socialAuthService: SocialAuthService) {}

  async execute(request: DisconnectInstagramRequest): Promise<DisconnectInstagramResponse> {
    const auth = await this.socialAuthService.getByUserAndPlatform(
      request.userId,
      "instagram"
    );

    if (!auth) {
      return { success: false };
    }

    await this.socialAuthService.delete(auth._id);
    return { success: true };
  }
}
```

### 4. API Routes
**Directory**: `app/api/auth/instagram/`

#### depends.ts
```typescript
import { SocialAuthRepository } from "@/infrastructure/repositories/social/social-auth-repo";
import type { SocialAuthService } from "@/core/application/interfaces/social/social-auth-service";
import { SaveInstagramTokenUseCase } from "@/core/application/usecases/social/instagram/save-instagram-token";
import { GetInstagramAuthUseCase } from "@/core/application/usecases/social/instagram/get-instagram-auth";
import { RefreshInstagramTokenUseCase } from "@/core/application/usecases/social/instagram/refresh-instagram-token";
import { DisconnectInstagramUseCase } from "@/core/application/usecases/social/instagram/disconnect-instagram";

const createSocialAuthRepository = async (): Promise<SocialAuthService> => {
  return new SocialAuthRepository();
};

export const createSaveInstagramTokenUseCase = async () => {
  const service = await createSocialAuthRepository();
  return new SaveInstagramTokenUseCase(service);
};

export const createGetInstagramAuthUseCase = async () => {
  const service = await createSocialAuthRepository();
  return new GetInstagramAuthUseCase(service);
};

export const createRefreshInstagramTokenUseCase = async () => {
  const service = await createSocialAuthRepository();
  return new RefreshInstagramTokenUseCase(service);
};

export const createDisconnectInstagramUseCase = async () => {
  const service = await createSocialAuthRepository();
  return new DisconnectInstagramUseCase(service);
};
```

#### start/route.ts
```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("admin_user_id");

    if (!userIdCookie) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    const appId = process.env.INSTAGRAM_APP_ID;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI ||
      `${process.env.NEXTAUTH_URL}/api/auth/instagram/callback`;

    if (!appId) {
      return NextResponse.json(
        { error: "Instagram integration not configured" },
        { status: 500 }
      );
    }

    const csrfState = Math.random().toString(36).substring(2);

    const response = NextResponse.redirect(
      buildAuthUrl(appId, redirectUri, csrfState)
    );

    response.cookies.set("instagram_oauth_state", csrfState, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
    });

    return response;
  } catch (error) {
    console.error("Error initiating Instagram OAuth:", error);
    return NextResponse.json(
      { error: "Failed to initiate Instagram OAuth" },
      { status: 500 }
    );
  }
}

const scope = [
  "instagram_basic",
  "instagram_content_publish",
  "pages_show_list",
  "pages_read_engagement",
].join(",");

function buildAuthUrl(appId: string, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    scope: scope,
    response_type: "code",
  });

  return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
}
```

#### callback/route.ts
```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    const baseUrl = process.env.APP_URL || request.nextUrl.origin;

    if (error) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=${encodeURIComponent(error)}&platform=instagram`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=missing_code&platform=instagram`
      );
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get("instagram_oauth_state");

    if (!storedState || storedState.value !== state) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=invalid_state&platform=instagram`
      );
    }

    const userIdCookie = cookieStore.get("admin_user_id");
    if (!userIdCookie) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=not_authenticated&platform=instagram`
      );
    }

    const tokenResponse = await exchangeCodeForToken(code);

    if (!tokenResponse.success || !tokenResponse.user_token || !tokenResponse.pages) {
      return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=${encodeURIComponent(
          tokenResponse.error || "token_exchange_failed"
        )}&platform=instagram`
      );
    }

    // Redirect to page selection (to get Instagram Business Account)
    const pageSelectionUrl = new URL(`${baseUrl}/crm/social/instagram/select-page`);
    pageSelectionUrl.searchParams.set("user_token", tokenResponse.user_token);
    pageSelectionUrl.searchParams.set("pages", JSON.stringify(tokenResponse.pages));

    const response = NextResponse.redirect(pageSelectionUrl.toString());
    response.cookies.delete("instagram_oauth_state");

    return response;
  } catch (error) {
    console.error("Instagram OAuth callback error:", error);
    const baseUrl = process.env.APP_URL || request.nextUrl.origin;
    return NextResponse.redirect(
      `${baseUrl}/crm/social/connections?error=${encodeURIComponent(
        error instanceof Error ? error.message : "callback_failed"
      )}&platform=instagram`
    );
  }
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
  };
}

async function exchangeCodeForToken(code: string): Promise<{
  success: boolean;
  user_token?: string;
  pages?: FacebookPage[];
  error?: string;
}> {
  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI ||
    `${process.env.NEXTAUTH_URL}/api/auth/instagram/callback`;

  if (!appId || !appSecret) {
    return { success: false, error: "Instagram configuration missing" };
  }

  try {
    // Step 1: Exchange code for short-lived token
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      client_secret: appSecret,
      code,
    });

    const response = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || "Token exchange failed",
      };
    }

    // Step 2: Get user's Facebook Pages with Instagram accounts
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${data.access_token}`
    );
    const pagesData = await pagesResponse.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      return {
        success: false,
        error: "No Facebook Pages found. Connect a Facebook Page with Instagram Business Account.",
      };
    }

    // Filter pages that have Instagram Business Account
    const pagesWithIG = pagesData.data.filter(
      (page: FacebookPage) => page.instagram_business_account
    );

    if (pagesWithIG.length === 0) {
      return {
        success: false,
        error: "No Instagram Business Accounts found. Please connect your Instagram account to a Facebook Page.",
      };
    }

    return {
      success: true,
      user_token: data.access_token,
      pages: pagesWithIG,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}
```

#### select-page/route.ts
```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSaveInstagramTokenUseCase } from "../depends";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("admin_user_id");

    if (!userIdCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { pageId, pages } = body;

    if (!pageId || !pages) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const selectedPage = pages.find((p: any) => p.id === pageId);
    if (!selectedPage || !selectedPage.instagram_business_account) {
      return NextResponse.json(
        { error: "Invalid page or no Instagram account" },
        { status: 400 }
      );
    }

    const igAccountId = selectedPage.instagram_business_account.id;
    const pageAccessToken = selectedPage.access_token;

    // Get Instagram account details
    const igResponse = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}?fields=id,username,name&access_token=${pageAccessToken}`
    );
    const igData = await igResponse.json();

    if (!igResponse.ok || igData.error) {
      return NextResponse.json(
        { error: igData.error?.message || "Failed to get Instagram details" },
        { status: 500 }
      );
    }

    // Save to database
    const useCase = await createSaveInstagramTokenUseCase();
    const result = await useCase.execute({
      userId: new ObjectId(userIdCookie.value),
      accessToken: pageAccessToken,
      expiresIn: 5184000, // 60 days
      instagramBusinessAccountId: igAccountId,
      username: igData.username || igData.name,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to save Instagram connection" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      channelId: result.channelId,
      username: igData.username,
    });
  } catch (error) {
    console.error("Instagram page selection error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to select page" },
      { status: 500 }
    );
  }
}
```

#### refresh/route.ts
```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRefreshInstagramTokenUseCase } from "../depends";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("admin_user_id");

    if (!userIdCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const useCase = await createRefreshInstagramTokenUseCase();
    const result = await useCase.execute({
      userId: new ObjectId(userIdCookie.value),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to refresh Instagram token" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error("Instagram token refresh error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Token refresh failed" },
      { status: 500 }
    );
  }
}
```

#### disconnect/route.ts
```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createDisconnectInstagramUseCase } from "../depends";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("admin_user_id");

    if (!userIdCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const useCase = await createDisconnectInstagramUseCase();
    const result = await useCase.execute({
      userId: new ObjectId(userIdCookie.value),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to disconnect Instagram" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Instagram disconnect error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Disconnect failed" },
      { status: 500 }
    );
  }
}
```

## Key Implementation Notes

### Instagram vs Facebook API Differences

1. **Authentication**:
   - Instagram uses Facebook OAuth but requires Instagram-connected Facebook Pages
   - Must filter pages to only show those with `instagram_business_account`
   - Page access token is used for Instagram API calls

2. **Posting Flow**:
   - Instagram requires 2-step publish: create container → publish container
   - Videos need status polling before publishing
   - No text-only posts (must have image/video)
   - Cannot edit posts after publishing

3. **Media Requirements**:
   - Images: JPG/PNG, max 8MB, 1:1 to 1.91:1 aspect ratio
   - Videos: MP4, max 100MB, 4-60 seconds for feed, up to 15 min for IGTV
   - Carousels: 2-10 items, all must be same type (image or video)

4. **API Endpoints**:
   - Use Instagram Graph API, not Facebook Graph API
   - Base URL: `https://graph.facebook.com/v19.0/`
   - Prefix endpoints with `/{instagram-business-account-id}/`

5. **Token Management**:
   - Long-lived tokens valid for 60 days
   - Can be refreshed before expiration
   - No refresh token, just exchange for new long-lived token

## Testing Checklist

- [ ] OAuth flow redirects to Facebook correctly
- [ ] State parameter validation prevents CSRF
- [ ] Only pages with Instagram accounts are shown
- [ ] Token is saved with correct expiration
- [ ] Can publish single image post
- [ ] Can publish video post with status polling
- [ ] Can publish carousel (multiple images)
- [ ] Metrics are fetched correctly
- [ ] Token refresh works before expiration
- [ ] Disconnect removes stored credentials
- [ ] Error handling for expired tokens
- [ ] Error handling for API rate limits

## References

- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- [Content Publishing](https://developers.facebook.com/docs/instagram-api/guides/content-publishing)
- [Insights](https://developers.facebook.com/docs/instagram-api/guides/insights)
