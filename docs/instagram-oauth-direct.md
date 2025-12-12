# Instagram OAuth Setup Guide (Direct Instagram OAuth)

## Overview

This guide covers **Instagram OAuth (Direct)** - not Facebook OAuth. This uses Instagram's own OAuth endpoints.

## Instagram OAuth Flow

### 1. Authorization Request
```
GET https://www.instagram.com/oauth/authorize
  ?client_id={INSTAGRAM_APP_ID}
  &redirect_uri={INSTAGRAM_REDIRECT_URI}
  &response_type=code
  &scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish
```

### 2. Token Exchange
```
POST https://api.instagram.com/oauth/access_token
  ?client_id={INSTAGRAM_APP_ID}
  &client_secret={INSTAGRAM_APP_SECRET}
  &grant_type=authorization_code
  &redirect_uri={INSTAGRAM_REDIRECT_URI}
  &code={authorization_code}
```

## Environment Variables

```env
# Instagram OAuth (Direct)
INSTAGRAM_APP_ID=758142603202360
INSTAGRAM_APP_SECRET=9b1ed0f0ff3b194176ac52f0666e30b2
INSTAGRAM_REDIRECT_URI=https://crm.linkstrategy.io.vn/api/auth/instagram/callback
INSTAGRAM_VERIFY_TOKEN=123456
```

## Required Scopes

- `instagram_business_basic` - Basic Instagram business account info
- `instagram_business_manage_messages` - Manage Instagram DMs
- `instagram_business_manage_comments` - Manage comments
- `instagram_business_content_publish` - Publish content to Instagram

## Facebook App Setup

Even though this is Instagram OAuth, you still need a Facebook App:

1. **Go to Facebook Developers Portal**
   - Visit: https://developers.facebook.com
   - Create/select your app

2. **Add Instagram Product**
   - Go to "Products" → "Add Product"
   - Add "Instagram" product

3. **Configure Instagram Basic Display**
   - Go to "Instagram" → "Basic Display"
   - Add your redirect URI:
     ```
     https://crm.linkstrategy.io.vn/api/auth/instagram/callback
     ```

4. **App Review & Permissions**
   - Submit for App Review
   - Request Instagram business permissions:
     - `instagram_business_basic`
     - `instagram_business_manage_messages`
     - `instagram_business_manage_comments`
     - `instagram_business_content_publish`

## Implementation Details

### Start Route (`/api/auth/instagram/start`)
- Uses `https://www.instagram.com/oauth/authorize`
- Uses Instagram App ID (not Facebook App ID)
- Uses Instagram business scopes

### Callback Route (`/api/auth/instagram/callback`)
- Uses `https://api.instagram.com/oauth/access_token`
- Exchanges authorization code for access token
- Handles Instagram-specific response format

## Differences from Facebook OAuth

| Aspect | Instagram OAuth (Direct) | Facebook OAuth |
|--------|-------------------------|----------------|
| Endpoint | `instagram.com/oauth/authorize` | `facebook.com/dialog/oauth` |
| App ID | Instagram App ID | Facebook App ID |
| Scopes | `instagram_business_*` | `instagram_*`, `pages_*` |
| Token Endpoint | `api.instagram.com/oauth/access_token` | `graph.facebook.com/oauth/access_token` |
| Use Case | Instagram Business API | Facebook/Instagram via Facebook |

## Testing

1. Ensure redirect URI is whitelisted in Facebook App settings
2. Test with Instagram Business Account
3. Verify all permissions are granted
4. Check token exchange works correctly

## Common Issues

- **Invalid App ID**: Make sure to use Instagram App ID, not Facebook App ID
- **Redirect URI Error**: URI must match exactly in Facebook App settings
- **Scope Issues**: Use Instagram business scopes, not Facebook scopes
- **App Review**: Instagram business permissions require review approval

## Webhook Configuration

Instagram webhooks are still configured through Facebook App settings, even with direct Instagram OAuth.

See: `/docs/instagram-webhooks.md` for webhook setup details.
