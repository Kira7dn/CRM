# WordPress Social Integration - Implementation TODO

## Checklist

### 1. Domain Layer
- [ ] Update `SocialPlatform` type trong [core/domain/social/social-auth.ts](core/domain/social/social-auth.ts)
  ```ts
  export type SocialPlatform = "tiktok" | "facebook" | "youtube" | "zalo" | "wordpress";
  ```

### 2. Infrastructure Layer - OAuth Gateway
- [ ] Tạo [infrastructure/adapters/external/social/auth/wordpress-oauth-gateway.ts](infrastructure/adapters/external/social/auth/wordpress-oauth-gateway.ts)
  ```ts
  export interface WordPressOAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    siteUrl?: string;
    isWPCom?: boolean;
  }
  export class WordPressOAuthGateway {
    getAuthorizationUrl(state?: string): string
    async exchangeToken(code: string): Promise<any>
    async refreshToken(refreshToken: string): Promise<any>
  }
  ```

### 3. Infrastructure Layer - Auth Service
- [ ] Tạo [infrastructure/adapters/external/social/auth/wordpress-auth-service.ts](infrastructure/adapters/external/social/auth/wordpress-auth-service.ts)
  ```ts
  export class WordPressAuthService extends BasePlatformAuthService {
    constructor(protected config: WordPressPlatformConfig)
    getAuthorizationUrl(state?: string): string
    async verifyAuth(): Promise<boolean>
    async refreshToken(): Promise<string | null>
    async getSiteInfo(): Promise<any>
  }
  ```

### 4. Infrastructure Layer - Post Gateway
- [ ] Tạo [infrastructure/adapters/external/social/posts/wordpress-post-gateway.ts](infrastructure/adapters/external/social/posts/wordpress-post-gateway.ts)
  ```ts
  export class WordPressPostGateway {
    async publish(auth: any, post: {
      title: string;
      content: string;
      status?: string;
    }): Promise<any>
  }
  ```

### 5. Infrastructure Layer - Repository
- [ ] Tạo hoặc cập nhật Social Auth Repository để support WordPress
  - Có thể dùng existing repository nếu đã có pattern chung
  - Hoặc tạo [infrastructure/repositories/wordpress-auth-repo.ts](infrastructure/repositories/wordpress-auth-repo.ts) extend `BaseRepository`

### 6. Application Layer - Use Cases
- [ ] [core/application/usecases/social/wordpress/detect-wordpress-type.ts](core/application/usecases/social/wordpress/detect-wordpress-type.ts)
  ```ts
  export class DetectWordPressTypeUseCase {
    async execute(siteUrl: string): Promise<{
      type: "wpcom" | "self-host-oauth" | "self-host-no-oauth" | "not-wordpress"
    }>
  }
  ```

- [ ] [core/application/usecases/social/wordpress/get-wordpress-authorization-url.ts](core/application/usecases/social/wordpress/get-wordpress-authorization-url.ts)
  ```ts
  export class GetWordPressAuthorizationUrlUseCase {
    execute(params: {
      siteUrl?: string;
      isWPCom?: boolean;
      state?: string;
    }): string
  }
  ```

- [ ] [core/application/usecases/social/wordpress/exchange-wordpress-token.ts](core/application/usecases/social/wordpress/exchange-wordpress-token.ts)
  ```ts
  export class ExchangeWordPressTokenUseCase {
    async execute(params: {
      code: string;
      isWPCom?: boolean;
      siteUrl?: string;
      siteId?: string;
      userId: string;
    }): Promise<{ tokenData: any; saved: any }>
  }
  ```

- [ ] [core/application/usecases/social/wordpress/publish-wordpress-post.ts](core/application/usecases/social/wordpress/publish-wordpress-post.ts)
  ```ts
  export class PublishWordPressPostUseCase {
    async execute(params: {
      userId: string;
      post: { title: string; content: string; status?: string }
    }): Promise<any>
  }
  ```

### 7. Factory Pattern
- [ ] Cập nhật [infrastructure/factories/platform-auth-factory.ts](infrastructure/factories/platform-auth-factory.ts)
  ```ts
  case "wordpress":
    return new WordPressAuthService(config);
  ```

### 8. API Routes (App Router)
- [ ] [app/api/auth/wordpress/authorize/route.ts](app/api/auth/wordpress/authorize/route.ts)
  - GET handler: redirect to WordPress OAuth

- [ ] [app/api/auth/wordpress/callback/route.ts](app/api/auth/wordpress/callback/route.ts)
  - GET handler: exchange code, save token, redirect to CRM

- [ ] [app/api/social/wordpress/detect/route.ts](app/api/social/wordpress/detect/route.ts)
  - POST handler: detect WordPress type (WP.com vs self-hosted)

- [ ] [app/api/social/wordpress/publish/route.ts](app/api/social/wordpress/publish/route.ts)
  - POST handler: publish post to WordPress

### 9. Dependencies (create depends.ts for each API route)
- [ ] [app/api/auth/wordpress/authorize/depends.ts](app/api/auth/wordpress/authorize/depends.ts)
- [ ] [app/api/auth/wordpress/callback/depends.ts](app/api/auth/wordpress/callback/depends.ts)
- [ ] [app/api/social/wordpress/detect/depends.ts](app/api/social/wordpress/detect/depends.ts)
- [ ] [app/api/social/wordpress/publish/depends.ts](app/api/social/wordpress/publish/depends.ts)

### 10. Queue Worker (Background Jobs)
- [ ] [infrastructure/queue/wordpress-worker.ts](infrastructure/queue/wordpress-worker.ts)
  ```ts
  const worker = new Worker("wordpress-publish", async job => {
    const usecase = new PublishWordPressPostUseCase();
    return usecase.execute(job.data);
  }, { connection });
  ```

### 11. UI Components
- [ ] Cập nhật [app/(features)/crm/settings/integrations/](app/(features)/crm/settings/integrations/) (hoặc tương tự)
  - WordPress connection form
  - Detect site type
  - OAuth flow trigger

- [ ] Cập nhật [app/(features)/crm/posts/](app/(features)/crm/posts/)
  - Add WordPress to platform selector
  - WordPress-specific post options

### 12. Environment Variables
- [ ] Thêm vào `.env.local`:
  ```env
  WP_CLIENT_ID=your_wordpress_client_id
  WP_CLIENT_SECRET=your_wordpress_client_secret
  WP_REDIRECT_URI=https://your-domain.com/api/auth/wordpress/callback
  ```

---

## Code Examples (Reference Only)

<details>
<summary>WordPressOAuthGateway (click to expand)</summary>

```ts
export class WordPressOAuthGateway {
  constructor(private cfg: WordPressOAuthConfig) {}

  getAuthorizationUrl(state?: string) {
    const baseUrl = this.cfg.isWPCom
      ? "https://public-api.wordpress.com/oauth2/authorize"
      : `${this.cfg.siteUrl}/oauth/authorize`;

    const params = new URLSearchParams({
      client_id: this.cfg.clientId,
      redirect_uri: this.cfg.redirectUri,
      response_type: "code",
      state: state || ""
    });

    return `${baseUrl}?${params}`;
  }

  async exchangeToken(code: string) {
    const tokenUrl = this.cfg.isWPCom
      ? "https://public-api.wordpress.com/oauth2/token"
      : `${this.cfg.siteUrl}/oauth/token`;

    const res = await axios.post(tokenUrl, {
      grant_type: "authorization_code",
      code,
      redirect_uri: this.cfg.redirectUri,
      client_id: this.cfg.clientId,
      client_secret: this.cfg.clientSecret,
    });

    return res.data;
  }

  async refreshToken(refreshToken: string) {
    const tokenUrl = this.cfg.isWPCom
      ? "https://public-api.wordpress.com/oauth2/token"
      : `${this.cfg.siteUrl}/oauth/token`;

    const res = await axios.post(tokenUrl, {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: this.cfg.clientId,
      client_secret: this.cfg.clientSecret,
    });

    return res.data;
  }
}
```
</details>

<details>
<summary>WordPressAuthService (click to expand)</summary>

```ts
export class WordPressAuthService extends BasePlatformAuthService {
  private oauth: WordPressOAuthGateway;

  constructor(protected config: WordPressPlatformConfig) {
    super(config);
    this.oauth = new WordPressOAuthGateway({
      clientId: process.env.WP_CLIENT_ID!,
      clientSecret: process.env.WP_CLIENT_SECRET!,
      redirectUri: process.env.WP_REDIRECT_URI!,
      siteUrl: config.siteUrl,
      isWPCom: config.tokenType === "wpcom",
    });
  }

  async verifyAuth(): Promise<boolean> {
    try {
      const url = this.config.tokenType === "wpcom"
        ? `https://public-api.wordpress.com/rest/v1.1/me`
        : `${this.config.siteUrl}/wp-json/wp/v2/users/me`;

      await axios.get(url, {
        headers: { Authorization: `Bearer ${this.getAccessToken()}` }
      });
      return true;
    } catch (err) {
      return false;
    }
  }

  async refreshToken(): Promise<string | null> {
    if (!this.config.refreshToken) return null;
    try {
      const data = await this.oauth.refreshToken(this.config.refreshToken);
      this.config.accessToken = data.access_token;
      this.config.refreshToken = data.refresh_token || this.config.refreshToken;
      if (data.expires_in) {
        this.config.expiresAt = new Date(Date.now() + data.expires_in * 1000);
      }
      return this.config.accessToken;
    } catch (err) {
      return null;
    }
  }
}
```
</details>

<details>
<summary>API Route Example (authorize)</summary>

```ts
// app/api/auth/wordpress/authorize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getWordPressAuthorizationUrlUseCase } from "./depends";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const siteUrl = url.searchParams.get("siteUrl") || undefined;
  const isWPCom = url.searchParams.get("wpcom") === "1";
  const state = url.searchParams.get("state") || "";

  const useCase = await getWordPressAuthorizationUrlUseCase();
  const authUrl = useCase.execute({ siteUrl, isWPCom, state });

  return NextResponse.redirect(authUrl);
}
```

```ts
// app/api/auth/wordpress/authorize/depends.ts
import { GetWordPressAuthorizationUrlUseCase } from "@/core/application/usecases/social/wordpress/get-wordpress-authorization-url";

export const getWordPressAuthorizationUrlUseCase = async () => {
  return new GetWordPressAuthorizationUrlUseCase();
};
```
</details>

---

## Notes

- **OAuth Flow**: Support cả WordPress.com (hosted) và self-hosted WordPress với OAuth plugin
- **Token Storage**: Lưu vào `social_auths` collection theo pattern hiện có
- **Publish Post**: Sử dụng WordPress REST API v2 (`/wp-json/wp/v2/posts`)
- **Background Jobs**: Sử dụng BullMQ queue `wordpress-publish` để xử lý async publishing
- **Error Handling**: Implement retry logic cho token refresh và API calls