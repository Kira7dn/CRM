# WordPress Integration Guide

## Overview

This CRM integrates with WordPress sites using **Jetpack OAuth**, a unified authentication system that works for both WordPress.com sites and self-hosted WordPress sites with Jetpack installed.

## Features

- ✅ Publish blog posts directly from the CRM
- ✅ Schedule WordPress content alongside other social platforms
- ✅ Manage multiple WordPress sites from one dashboard
- ✅ Support for both WordPress.com and self-hosted WordPress
- ✅ No token expiration (Jetpack OAuth tokens are permanent)

## Prerequisites

### For WordPress.com Sites
No additional setup required! WordPress.com sites work immediately with Jetpack OAuth.

### For Self-Hosted WordPress
Your self-hosted WordPress site must have the Jetpack plugin installed and connected to WordPress.com:

1. Install the Jetpack plugin from the WordPress plugin directory
2. Activate the plugin
3. Connect your site to WordPress.com following the on-screen instructions
4. Once connected, your site can use Jetpack OAuth

## Setup Instructions

### 1. Create a WordPress Application

1. Go to [WordPress Developer Apps](https://developer.wordpress.com/apps/)
2. Click "Create New Application"
3. Fill in the application details:
   - **Name**: Your CRM Name
   - **Description**: CRM Integration for WordPress
   - **Website URL**: Your CRM URL (e.g., `https://crm.linkstrategy.io.vn`)
   - **Redirect URLs**: Add your callback URL:
     ```
     https://your-domain.com/api/auth/wordpress/callback
     ```
   - **Type**: Web

4. After creation, you'll receive:
   - **Client ID**
   - **Client Secret**

### 2. Configure Environment Variables

Add the following to your `.env` or `.env.local` file:

```env
# WordPress Integration (Jetpack OAuth)
WP_CLIENT_ID=your_client_id_here
WP_CLIENT_SECRET=your_client_secret_here
WP_REDIRECT_URI=https://your-domain.com/api/auth/wordpress/callback

# App URL (important for OAuth redirects)
APP_URL=https://your-domain.com
```

**Important:** The `APP_URL` must match your actual domain to ensure OAuth redirects work correctly, especially when using reverse proxies like Cloudflare.

### 3. Connect WordPress Sites

1. Navigate to **CRM → Social → Connections**
2. Click **Connect** on the WordPress card
3. You'll be redirected to WordPress.com to authorize access
4. Select the site(s) you want to connect
5. Authorize the application
6. You'll be redirected back to the CRM with the connection established

## Architecture

### OAuth Flow

```
User clicks "Connect WordPress"
    ↓
CRM redirects to /api/auth/wordpress/start
    ↓
Redirects to /crm/social/connections/wordpress/setup
    ↓
Auto-redirects to /api/auth/wordpress/authorize
    ↓
Redirects to WordPress.com OAuth (public-api.wordpress.com/oauth2/authorize)
    ↓
User authorizes on WordPress.com
    ↓
WordPress.com redirects to /api/auth/wordpress/callback with auth code
    ↓
CRM exchanges code for access token (using public-api.wordpress.com/oauth2/token)
    ↓
CRM fetches site info and saves to database
    ↓
User redirected back to /crm/social/connections?connected=wordpress
```

### Token Storage

After successful OAuth, the following information is stored in the `social_auth` collection:

```javascript
{
  platform: "wordpress",
  openId: "123456", // blog_id from Jetpack
  pageName: "https://example.com", // blog_url from Jetpack
  accessToken: "xxx", // Permanent access token
  refreshToken: "", // Not used (Jetpack tokens don't expire)
  expiresAt: Date(1 year from now), // Set far in future for consistency
  scope: "global", // Full access to site
  userId: ObjectId("...")
}
```

### API Endpoints Used

All WordPress operations use the **WordPress.com REST API** (works for both .com and Jetpack sites):

- **Site Info**: `GET https://public-api.wordpress.com/rest/v1.1/sites/{blog_id}`
- **Create Post**: `POST https://public-api.wordpress.com/rest/v1.1/sites/{blog_id}/posts/new`
- **Update Post**: `POST https://public-api.wordpress.com/rest/v1.1/sites/{blog_id}/posts/{post_id}`
- **Delete Post**: `POST https://public-api.wordpress.com/rest/v1.1/sites/{blog_id}/posts/{post_id}/delete`

## Publishing Posts

### From the CRM UI

1. Navigate to **CRM → Campaigns → Posts**
2. Click **Create New Post**
3. Select **WordPress** as one of the platforms
4. Choose content type (Post or Article recommended for WordPress)
5. Fill in post details:
   - **Title**: Post title
   - **Content**: Post body (supports HTML)
   - **Media**: Featured image URL
6. Select schedule or publish immediately
7. Click **Save & Publish** or **Schedule**

### Via API

```typescript
POST /api/social/wordpress/publish
{
  "userId": "user_id",
  "title": "My Blog Post",
  "content": "<p>Post content with HTML</p>",
  "status": "publish", // or "draft"
  "featured_image": "https://example.com/image.jpg",
  "categories": ["Technology", "News"],
  "tags": ["wordpress", "api"]
}
```

## Troubleshooting

### No Site Selected During Authorization

**Problem**: Error message "No WordPress site was selected during authorization" with `blog_id: '0'`.

**Root Cause**: You don't have any WordPress sites connected to your WordPress.com account.

**Solution**:

**For WordPress.com sites:**
1. Log in to [WordPress.com](https://wordpress.com)
2. Create a new site or verify you have at least one site in your account
3. Return to CRM and try connecting again

**For self-hosted WordPress:**
1. Install the Jetpack plugin on your WordPress site:
   ```bash
   # Via WP-CLI
   wp plugin install jetpack --activate

   # Or manually from WordPress admin:
   # Plugins → Add New → Search "Jetpack" → Install → Activate
   ```

2. Connect Jetpack to WordPress.com:
   - Go to **Jetpack → Dashboard** in WordPress admin
   - Click **Set up Jetpack**
   - Log in with your WordPress.com account
   - Authorize the connection

3. Verify connection:
   - You should see "Connected to WordPress.com" status
   - Your site should appear in [wordpress.com/sites](https://wordpress.com/sites)

4. Return to CRM and try connecting again

### OAuth Redirects to Localhost

**Problem**: When clicking "Connect WordPress", it redirects to localhost instead of your production URL.

**Solution**: Ensure `APP_URL` is set correctly in your environment variables:

```env
APP_URL=https://your-production-domain.com
```

The system uses this priority for determining the redirect URL:
1. `APP_URL`
2. `NGROK_TUNNEL`
3. `NEXT_PUBLIC_APP_URL`
4. `http://localhost:3000` (fallback)

### Self-Hosted Site Not Working

**Problem**: Self-hosted WordPress site cannot connect.

**Solution**: Verify Jetpack is installed and connected:
1. In WordPress admin, go to **Jetpack → Settings**
2. Ensure status shows "Connected to WordPress.com"
3. If not connected, click "Connect to WordPress.com" and follow the setup

### Token Expired Error

**Problem**: Receiving token expired errors.

**Solution**: This shouldn't happen with Jetpack OAuth as tokens are permanent. If you see this error:
1. Disconnect the WordPress connection in CRM
2. Reconnect using the OAuth flow
3. Verify the new token is saved correctly

## Key Files

- **OAuth Gateway**: `infrastructure/adapters/external/social/auth/wordpress-oauth-gateway.ts`
- **Auth Service**: `infrastructure/adapters/external/social/auth/wordpress-auth-service.ts`
- **Post Gateway**: `infrastructure/adapters/external/social/posts/wordpress-post-gateway.ts`
- **Use Cases**: `core/application/usecases/social/wordpress/`
- **API Routes**: `app/api/auth/wordpress/`
- **UI Setup Page**: `app/(features)/crm/social/connections/wordpress/setup/page.tsx`
- **Worker**: `infrastructure/queue/wordpress-worker.ts`

## WordPress.com API Reference

- [OAuth2 Authentication](https://developer.wordpress.com/docs/oauth2/)
- [REST API Documentation](https://developer.wordpress.com/docs/api/)
- [Posts Endpoint](https://developer.wordpress.com/docs/api/1.1/post/sites/%24site/posts/new/)

## Support

For issues or questions about WordPress integration:
1. Check the WordPress.com API status
2. Verify your OAuth credentials are correct
3. Ensure Jetpack is properly connected (for self-hosted sites)
4. Check CRM logs for detailed error messages
