# WordPress Social Integration - Implementation Summary

## ✅ Completed Implementation

WordPress Social Integration đã được triển khai hoàn tất theo đúng Clean/Onion Architecture của dự án.

---

## 📁 Files Created

### Domain Layer
- ✅ [core/domain/social/social-auth.ts](core/domain/social/social-auth.ts) - Updated `SocialPlatform` type to include "wordpress"

### Infrastructure Layer - OAuth & Auth
- ✅ [infrastructure/adapters/external/social/auth/wordpress-oauth-gateway.ts](infrastructure/adapters/external/social/auth/wordpress-oauth-gateway.ts) - OAuth 2.0 flow handler
- ✅ [infrastructure/adapters/external/social/auth/wordpress-auth-service.ts](infrastructure/adapters/external/social/auth/wordpress-auth-service.ts) - Auth service extends `BasePlatformAuthService`

### Infrastructure Layer - Posts
- ✅ [infrastructure/adapters/external/social/posts/wordpress-post-gateway.ts](infrastructure/adapters/external/social/posts/wordpress-post-gateway.ts) - Post publishing gateway

### Infrastructure Layer - Factory
- ✅ [infrastructure/factories/platform-auth-factory.ts](infrastructure/factories/platform-auth-factory.ts) - Platform auth service factory

### Infrastructure Layer - Queue Worker
- ✅ [infrastructure/queue/wordpress-worker.ts](infrastructure/queue/wordpress-worker.ts) - BullMQ worker for background jobs

### Application Layer - Use Cases
- ✅ [core/application/usecases/social/wordpress/detect-wordpress-type.ts](core/application/usecases/social/wordpress/detect-wordpress-type.ts)
- ✅ [core/application/usecases/social/wordpress/get-wordpress-authorization-url.ts](core/application/usecases/social/wordpress/get-wordpress-authorization-url.ts)
- ✅ [core/application/usecases/social/wordpress/exchange-wordpress-token.ts](core/application/usecases/social/wordpress/exchange-wordpress-token.ts)
- ✅ [core/application/usecases/social/wordpress/publish-wordpress-post.ts](core/application/usecases/social/wordpress/publish-wordpress-post.ts)

### API Layer - Routes
- ✅ [app/api/auth/wordpress/authorize/route.ts](app/api/auth/wordpress/authorize/route.ts) + depends.ts
- ✅ [app/api/auth/wordpress/callback/route.ts](app/api/auth/wordpress/callback/route.ts) + depends.ts
- ✅ [app/api/social/wordpress/detect/route.ts](app/api/social/wordpress/detect/route.ts) + depends.ts
- ✅ [app/api/social/wordpress/publish/route.ts](app/api/social/wordpress/publish/route.ts) + depends.ts

### Configuration
- ✅ [.env.example](.env.example) - Added WordPress environment variables

---

## 🏗️ Architecture Details

### Supported WordPress Types
1. **WordPress.com** (hosted)
   - OAuth via `public-api.wordpress.com`
   - REST API v1.1

2. **Self-hosted with OAuth plugin**
   - OAuth via `/oauth/authorize` endpoint
   - REST API v2 (`/wp-json/wp/v2/`)

### Key Features

#### 1. OAuth Flow
```
User → Detect Site Type → Authorization URL → WordPress OAuth → Callback → Save Token
```

#### 2. Post Publishing
- Support for posts, drafts, pending, private status
- Featured images, categories, tags
- Both WordPress.com and self-hosted

#### 3. Background Jobs (BullMQ)
- `publishPost` - Async post publishing
- `updatePost` - Update existing posts
- `refreshToken` - Auto token refresh
- `checkExpiringTokens` - Daily cron job to check tokens expiring within 7 days

#### 4. Token Management
- Auto-refresh for tokens expiring within 7 days
- Token storage in MongoDB `social_auth` collection
- Expiration tracking

---

## 🔧 Environment Variables Required

```env
# WordPress Integration
WP_CLIENT_ID=your_wordpress_client_id
WP_CLIENT_SECRET=your_wordpress_client_secret
WP_REDIRECT_URI=https://your-domain.com/api/auth/wordpress/callback
```

### Getting WordPress.com Credentials
1. Go to https://developer.wordpress.com/apps/
2. Create a new application
3. Set redirect URI: `https://your-domain.com/api/auth/wordpress/callback`
4. Copy Client ID and Client Secret

### Self-hosted WordPress Setup
1. Install OAuth plugin (e.g., WP OAuth Server)
2. Configure OAuth application
3. Use same environment variables

---

## 📡 API Endpoints

### Authentication Flow
```
GET  /api/social/wordpress/detect
     Body: { siteUrl: string }
     Response: { type: "wpcom" | "self-host-oauth" | "self-host-no-oauth" | "not-wordpress" }

GET  /api/auth/wordpress/authorize?siteUrl=...&wpcom=1&state=...
     Redirects to WordPress OAuth

GET  /api/auth/wordpress/callback?code=...&state=...&wpcom=1&siteUrl=...
     Handles OAuth callback, saves token, redirects to CRM
```

### Post Publishing
```
POST /api/social/wordpress/publish
     Body: {
       userId: string,
       post: {
         title: string,
         content: string,
         status?: "publish" | "draft" | "pending" | "private",
         excerpt?: string,
         featured_media?: number,
         categories?: number[],
         tags?: number[]
       }
     }
     Response: { success: boolean, wordpressPostId?: number, ... }
```

---

## 🔄 Worker Jobs

### Queue Operations
```typescript
import { addPublishPostJob } from "@/infrastructure/queue/wordpress-worker";

// Enqueue post publishing job
await addPublishPostJob({
  userId: "...",
  post: {
    title: "Post Title",
    content: "Post content...",
    status: "publish"
  }
});
```

### Starting Worker
```typescript
import { initializeWordPressWorker } from "@/infrastructure/queue/wordpress-worker";

// Initialize worker (usually in server startup)
initializeWordPressWorker();
```

---

## ✅ Build Status

```bash
npm run build
```

**Status: ✅ SUCCESS**

All TypeScript compilation passed. WordPress routes are registered:
- `/api/auth/wordpress/authorize`
- `/api/auth/wordpress/callback`
- `/api/social/wordpress/detect`
- `/api/social/wordpress/publish`

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Detect WordPress.com site
- [ ] Detect self-hosted WordPress site
- [ ] OAuth flow for WordPress.com
- [ ] OAuth flow for self-hosted
- [ ] Publish post to WordPress.com
- [ ] Publish post to self-hosted
- [ ] Token refresh (manual trigger)
- [ ] Background job publishing

### Integration Testing
- [ ] Unit tests for use cases
- [ ] Integration tests for OAuth flow
- [ ] End-to-end test for publish post
- [ ] Worker job tests

---

## 📝 Next Steps

### 1. UI Integration
Create WordPress connection UI in:
- `app/(features)/crm/settings/integrations/`
  - WordPress site URL input
  - Detect button
  - Connect button (triggers OAuth)
  - Disconnect button

### 2. Post Publishing UI
Update `app/(features)/crm/posts/`:
- Add WordPress to platform selector
- Show WordPress-specific options (status, categories, tags)

### 3. WordPress Site Management
Store additional site metadata:
- Site name
- Site URL
- WordPress type (WP.com vs self-hosted)
- Available categories/tags

### 4. Worker Initialization
Add to server startup script:
```typescript
import { initializeWordPressWorker, scheduleTokenRefreshCheck } from "@/infrastructure/queue/wordpress-worker";

// Start worker
initializeWordPressWorker();

// Schedule daily token refresh check
await scheduleTokenRefreshCheck();
```

---

## 🐛 Known Limitations

1. **Token Type Detection**: Currently infers WordPress type from stored `openId`/`pageName`. Consider storing explicit `tokenType` field in `SocialAuth`.

2. **Site Info Storage**: Site metadata (categories, tags) not cached. Consider adding a `wordpress_sites` collection.

3. **Media Upload**: Featured image upload not implemented. Need to add media upload endpoint.

4. **Error Handling**: OAuth errors redirect to integrations page with error param. Consider showing user-friendly error messages.

---

## 📚 References

- [WordPress.com OAuth Documentation](https://developer.wordpress.com/docs/oauth2/)
- [WordPress REST API v2](https://developer.wordpress.org/rest-api/)
- [WP OAuth Server Plugin](https://wp-oauth.com/)
- [BullMQ Documentation](https://docs.bullmq.io/)

---

**Implementation Date**: 2025-12-11
**Status**: ✅ Complete - Ready for UI Integration
