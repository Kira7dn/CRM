# Facebook App OAuth Configuration

## Redirect URI Whitelist Issue

The error "redirect URI is not whitelisted" means you need to add your callback URL to Facebook App settings.

## Required Redirect URIs

Add these URLs to your Facebook App's Valid OAuth Redirect URIs:

### For Instagram OAuth:
```
https://crm.linkstrategy.io.vn/api/auth/instagram/callback
```

### For Facebook OAuth (if needed):
```
https://crm.linkstrategy.io.vn/api/auth/facebook/callback
```

## Step-by-Step Setup:

1. **Go to Facebook Developers Portal**
   - Visit: https://developers.facebook.com
   - Login and select your app

2. **Navigate to App Settings**
   - Go to "Settings" → "Basic"
   - Scroll down to "Security" section

3. **Configure OAuth Settings**
   - Make sure "Client OAuth Login" is **enabled**
   - Make sure "Web OAuth Login" is **enabled**
   - Add redirect URIs to "Valid OAuth Redirect URIs"

4. **Add Redirect URIs**
   - Click "Add Platform" if needed
   - Add: `https://crm.linkstrategy.io.vn/api/auth/instagram/callback`
   - Add: `https://crm.linkstrategy.io.vn/api/auth/facebook/callback`

5. **Save Changes**
   - Click "Save Changes" at the bottom

6. **App Review Settings**
   - Go to "App Review" section
   - Make sure Instagram products are approved
   - Request necessary permissions:
     - `instagram_basic`
     - `instagram_content_publish`
     - `pages_show_list`
     - `pages_read_engagement`

## Environment Variables Configuration

Your `.env` file should have:
```env
# Facebook App (Primary for Instagram OAuth)
FACEBOOK_APP_ID=2327855557591579
FACEBOOK_APP_SECRET=5c5bc282a709dc62e472c6b7d0cf75f1
FACEBOOK_REDIRECT_URI=https://crm.linkstrategy.io.vn/api/auth/facebook/callback

# Instagram (Uses Facebook App credentials)
INSTAGRAM_REDIRECT_URI=https://crm.linkstrategy.io.vn/api/auth/instagram/callback
INSTAGRAM_VERIFY_TOKEN=123456
```

## Testing

After configuration:
1. Restart your application
2. Try connecting Instagram again
3. The OAuth flow should work without redirect URI errors

## Common Issues

- **HTTPS Required**: Facebook requires HTTPS URLs for production
- **Exact Match**: Redirect URI must match exactly (no trailing slashes)
- **App Mode**: Make sure app is in "Live" mode, not "Development"
- **Permissions**: Ensure all required permissions are approved

## Local Development

For local development, you may need to:
1. Use ngrok or similar tool for HTTPS
2. Add ngrok URL to Facebook App settings
3. Update environment variables temporarily
