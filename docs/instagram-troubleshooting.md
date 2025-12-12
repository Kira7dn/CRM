# Instagram OAuth Troubleshooting

## Issue: `/me/accounts` Returns Empty Data Array

### Symptoms
```json
{
  "data": []
}
```

When calling `https://graph.facebook.com/v21.0/me/accounts`, the API returns an empty array even though the OAuth flow succeeded.

### Root Causes

#### 1. User Has No Facebook Pages
The `/me/accounts` endpoint only returns **Facebook Pages** that the user manages/owns. If the user has:
- No Facebook Pages created
- Only a personal Facebook profile (not a Page)
- Pages where they are not an admin/editor

Then the endpoint will return empty data.

**How to verify:**
1. Log into Facebook with the test account
2. Go to https://www.facebook.com/pages
3. Check if any Pages are listed

**Solution:**
- Create a Facebook Page: https://www.facebook.com/pages/create
- Make sure the test user is Page admin/editor

#### 2. Missing or Unapproved Permissions
The Facebook App needs these permissions **approved via App Review**:

Required permissions:
- `pages_show_list` ⚠️ **Critical** - Without this, `/me/accounts` returns empty
- `pages_read_engagement`
- `instagram_basic`
- `instagram_manage_comments`
- `instagram_manage_messages`
- `instagram_content_publish`

**How to verify:**
Check the permissions response logged in console:
```typescript
console.log("[Instagram OAuth] Token permissions:", permissionsData.data);
```

Look for:
```json
{
  "data": [
    { "permission": "pages_show_list", "status": "granted" },
    { "permission": "instagram_basic", "status": "granted" }
  ]
}
```

**Solution:**
1. Go to Facebook Developer Console: https://developers.facebook.com
2. Select your app
3. Go to "App Review" → "Permissions and Features"
4. Request review for:
   - `pages_show_list`
   - `pages_read_engagement`
   - All Instagram permissions

**During Development (Before App Review):**
- Add test users to the app
- Test users can use the app even without approved permissions
- Go to "Roles" → "Test Users" to add test accounts

#### 3. Facebook Page Not Connected to Instagram Business Account
Even if user has Pages, they need to be connected to Instagram Business Accounts.

**How to verify:**
Check the response for `instagram_business_account` field:
```typescript
console.log("[Instagram OAuth] All pages before filter:", pagesData.data.map((p: any) => ({
  id: p.id,
  name: p.name,
  hasIG: !!p.instagram_business_account,
  igId: p.instagram_business_account?.id
})));
```

**Solution:**
1. Open Facebook Page Settings
2. Go to "Instagram" section
3. Click "Connect Account"
4. Link an Instagram Business or Creator account

**Note:** Personal Instagram accounts cannot be linked - must convert to Business/Creator first:
- Open Instagram app
- Go to Settings → Account
- Switch to Professional Account

#### 4. App in Development Mode
If the Facebook App is in "Development Mode", only the following can use it:
- App developers
- App testers
- Test users

**How to verify:**
1. Go to Facebook Developer Console
2. Check app status in top bar (should say "Development" or "Live")

**Solution for Testing:**
- Keep in Development Mode
- Add test accounts via "Roles" → "Test Users"

**Solution for Production:**
- Complete App Review
- Switch app to "Live" mode

#### 5. API Version Compatibility
Using Graph API v21.0 (latest as of 2025).

**Current implementation:**
```typescript
const baseUrl = "https://graph.facebook.com/v21.0";
```

Some API behaviors changed in v21.0 (released October 2024). Metrics like `video_views`, `email_contacts`, `profile_views` were deprecated.

**Solution:**
- Stay on v21.0 (recommended)
- Monitor Meta's changelog: https://developers.facebook.com/docs/graph-api/changelog

### Debugging Checklist

Run through this checklist to diagnose the issue:

- [ ] User has at least one Facebook Page
- [ ] User is admin/editor of the Page
- [ ] Facebook App has `pages_show_list` permission
- [ ] Permission is either approved OR user is test user
- [ ] Facebook Page is connected to Instagram Business Account
- [ ] Instagram account is Business/Creator (not Personal)
- [ ] Test user is added to app (if in Development Mode)
- [ ] Check permissions API response for "granted" status
- [ ] Check Graph API version compatibility

### Code Debugging Steps

The current implementation in `instagram-oauth-adapter.ts` already includes extensive logging:

1. **Check token permissions:**
```typescript
const permissionsURL = `https://graph.facebook.com/v21.0/me/permissions?access_token=${userToken}`;
```

2. **Check basic pages response:**
```typescript
const basicPagesURL = `https://graph.facebook.com/v21.0/me/accounts?access_token=${userToken}`;
```

3. **Check pages with fields:**
```typescript
const pagesURL = `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${userToken}`;
```

Review console output to identify which step is failing.

### Fallback Behavior

Current implementation includes fallback when no Pages found:

```typescript
if (pagesWithIG.length === 0) {
  // Creates basic Instagram connection without Page
  pagesWithIG = [{
    id: userData.id || "instagram_user",
    name: `Instagram Connection (${userData.name || "User"})`,
    access_token: userToken,
    is_basic_instagram: true
  }];
}
```

This allows users to connect even without Facebook Pages, but with limited functionality.

### References

- [Facebook Graph API v21.0 Documentation](https://developers.facebook.com/docs/graph-api/changelog/version21.0)
- [Instagram Graph API Guide](https://developers.facebook.com/docs/instagram-api)
- [App Review Process](https://developers.facebook.com/docs/app-review)
- [Troubleshooting Instagram API Issues (Medium)](https://medium.com/@python-javascript-php-html-css/troubleshooting-instagram-api-issues-missing-pages-and-instagram-details-7be62e18eb8e)

### Quick Fix for Development

For immediate testing without App Review:

1. Create a Facebook Test User:
   - Go to Facebook Developer Console → Roles → Test Users
   - Click "Add Test Users"
   - Create test user

2. Create Facebook Page with test user:
   - Log in as test user
   - Create a Facebook Page
   - Convert Instagram to Business account
   - Link Instagram to Facebook Page

3. Test OAuth flow with test user account

This bypasses the need for App Review during development.
