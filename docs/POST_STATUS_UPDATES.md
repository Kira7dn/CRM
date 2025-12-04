# Post Status Management Updates

**Date**: December 4, 2025

## Overview

Updated post status management to properly handle draft, scheduled, and published states according to domain definition: `PostStatus = "draft" | "scheduled" | "published" | "failed" | "archived"`

## Changes Made

### 1. CreatePostUseCase Logic (core/application/usecases/marketing/post/create-post.ts)

**New Status Determination Logic**:
```typescript
if (request.saveAsDraft) {
  postStatus = "draft"
} else if (request.scheduledAt && new Date(request.scheduledAt) > new Date()) {
  postStatus = "scheduled"
} else if (request.platforms && request.platforms.length > 0) {
  postStatus = "published"
}
```

**Key Changes**:
- Added `saveAsDraft?: boolean` parameter to `CreatePostRequest`
- Status is determined before platform publishing
- Platforms are only published to if NOT saving as draft
- PlatformMetadata status is set correctly for each scenario
- Draft/scheduled posts skip platform publishing

### 2. PostForm Component (app/(features)/crm/campaigns/posts/_components/PostForm.tsx)

#### New Features:

**a) Save as Draft Button**
- Added "Save as Draft" button (only visible when creating new posts)
- Button positioned on left side of action bar

**b) Auto-Save on Close**
- Detects unsaved changes (title or body has content)
- Shows confirmation dialog when closing with unsaved changes
- Prompts: "You have unsaved changes. Save as draft before closing?"
- Auto-saves as draft if user confirms

**c) Visual Indicators**
- Shows "• Unsaved changes" badge next to title when form has unsaved content
- Badge styled in amber color for visibility
- Only shown for new posts (not edits)

**d) Smart Submit Button Text**
- "Publish Now" - when no scheduledAt
- "Schedule Post" - when scheduledAt is set
- "Update Post" - when editing existing post

**e) Context-Aware Toast Messages**
- "Saving draft..." when saving draft
- "Scheduling post..." when scheduling
- "Publishing to platforms..." when publishing now
- Shows appropriate success/error messages for each scenario

#### Technical Implementation:

**State Management**:
```typescript
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

// Track changes
useEffect(() => {
  if (!post && hasContent()) {
    setHasUnsavedChanges(true)
  }
}, [title, body, post])
```

**Auto-Save Logic**:
```typescript
const handleClose = async () => {
  if (!post && hasUnsavedChanges && hasContent()) {
    const shouldSave = confirm('You have unsaved changes. Save as draft before closing?')
    if (shouldSave) {
      await handleSaveDraft()
    }
  }
  onClose?.()
}
```

### 3. Server Action Updates (app/(features)/crm/campaigns/posts/actions.ts)

**Added Parameter**:
```typescript
const saveAsDraft = formData.get("saveAsDraft")?.toString() === "true"
```

**Passed to Use Case**:
```typescript
const result = await useCase.execute({
  userId: userIdCookie.value,
  title,
  body,
  contentType,
  platforms,
  media,
  hashtags,
  scheduledAt,
  saveAsDraft, // New parameter
  createdAt: now,
  updatedAt: now,
})
```

## Status Flow Diagram

```
User Action          → Post Status    → Platform Publishing
────────────────────────────────────────────────────────────
Click "Save as Draft"  → draft        → ❌ Skip publishing
Set future date +      → scheduled    → ❌ Skip publishing
Click "Schedule Post"

Click "Publish Now"    → published    → ✅ Publish to platforms
(no schedule date)

Close form with        → draft        → ❌ Skip publishing
unsaved changes +      (if user
user confirms          confirms)
```

## User Experience Flow

### Scenario 1: Creating Draft
1. User types content
2. Banner shows "• Unsaved changes"
3. User clicks "Save as Draft"
4. Toast: "Draft saved successfully"
5. Post created with status="draft" in all platforms
6. Form closes

### Scenario 2: Scheduling Post
1. User types content
2. User sets scheduledAt to future date
3. User clicks "Schedule Post"
4. Toast: "Scheduling post..."
5. Post created with status="scheduled"
6. Platform publishing skipped
7. Form closes

### Scenario 3: Publishing Now
1. User types content
2. User clicks "Publish Now"
3. Toast: "Publishing to platforms..."
4. Platform adapters called for each platform
5. Post created with status="published"
6. Individual toasts for each platform result
7. Form closes

### Scenario 4: Auto-Save on Close
1. User types content
2. Banner shows "• Unsaved changes"
3. User clicks X or Cancel
4. Confirm dialog: "You have unsaved changes. Save as draft before closing?"
5. If YES → saves as draft, then closes
6. If NO → closes without saving

## Database Impact

### PlatformMetadata Status Values

**Draft**:
```typescript
{
  platform: "facebook",
  status: "draft",
  publishedAt: undefined,
  postId: undefined,
  permalink: undefined
}
```

**Scheduled**:
```typescript
{
  platform: "facebook",
  status: "scheduled",
  publishedAt: undefined,
  postId: undefined,
  permalink: undefined
}
```

**Published** (successful):
```typescript
{
  platform: "facebook",
  status: "published",
  publishedAt: Date,
  postId: "fb_123456",
  permalink: "https://facebook.com/...",
  error: undefined
}
```

**Failed**:
```typescript
{
  platform: "facebook",
  status: "failed",
  publishedAt: undefined,
  postId: undefined,
  permalink: undefined,
  error: "Error message"
}
```

## Benefits

1. **Data Integrity**: Post status accurately reflects actual state
2. **User Experience**: Clear feedback on what action is being performed
3. **No Lost Work**: Auto-save prevents accidental data loss
4. **Flexibility**: Users can save partial work and continue later
5. **Visibility**: Unsaved changes indicator prevents confusion
6. **Correct Status**: Draft/scheduled posts don't attempt platform publishing

## Testing Checklist

- [ ] Create draft → status = "draft", no platform publishing
- [ ] Schedule future post → status = "scheduled", no platform publishing
- [ ] Publish now → status = "published", platforms published to
- [ ] Close with unsaved changes → confirm dialog appears
- [ ] Confirm auto-save → draft saved, form closes
- [ ] Decline auto-save → form closes, data lost
- [ ] "Unsaved changes" badge appears when typing
- [ ] Badge disappears after save
- [ ] Submit button text changes based on context
- [ ] Toast messages appropriate for each action

## Future Enhancements

1. **Background Auto-Save**: Automatic draft saving every 30 seconds
2. **Draft Recovery**: Recover unsaved drafts after browser crash
3. **Version History**: Track draft revisions
4. **Scheduled Publishing**: Background worker to publish scheduled posts
5. **Conflict Resolution**: Handle concurrent edits to same draft

---

**Status**: ✅ Complete
**Tested**: Manual testing in dev environment
**Breaking Changes**: None - backward compatible
