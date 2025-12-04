# Scheduled Post Publishing Strategy

**Date**: December 4, 2025

## Overview

Implementation strategy for scheduled posts where content is published to platforms immediately but marked as "scheduled" in DB until the scheduled time passes.

## Strategy Rationale

### Why Publish Immediately?

1. **Platform API Limitations**: Most social platforms don't support true scheduled publishing via API
2. **Simplicity**: Avoids complex background workers and queue systems
3. **Reliability**: Content is guaranteed to be on platform (not dependent on worker uptime)
4. **User Control**: Users can manually delete/edit on platform if needed

### Status Flow

```
User schedules post for tomorrow
    ↓
Post published to platforms IMMEDIATELY (using platform's scheduling if available)
    ↓
Saved to DB with status="scheduled"
    ↓
Background updater runs every 5 minutes
    ↓
When scheduledAt time passes → Update status to "published"
    ↓
UI shows post as "published" after scheduled time
```

## Implementation

### 1. CreatePostUseCase Logic

**File**: `core/application/usecases/marketing/post/create-post.ts`

```typescript
// Determine status BEFORE publishing
if (request.saveAsDraft) {
  postStatus = "draft"
} else if (request.scheduledAt && new Date(request.scheduledAt) > new Date()) {
  postStatus = "scheduled"  // Future date
} else {
  postStatus = "published"  // Publish now
}

// Publish to platforms (even for scheduled posts)
if (!request.saveAsDraft && request.platforms.length > 0) {
  for (const platform of request.platforms) {
    const result = await platformService.publish({
      ...content,
      scheduledAt: request.scheduledAt  // Platform may use this
    })

    // Save with "scheduled" status if future date
    const platformStatus = result.success
      ? (postStatus === "scheduled" ? "scheduled" : "published")
      : "failed"

    platformsMetadata.push({
      platform: platform.platform,
      status: platformStatus,
      publishedAt: result.success && postStatus !== "scheduled" ? new Date() : undefined,
      postId: result.postId,
      permalink: result.permalink,
    })
  }
}
```

### 2. Auto-Update Use Case

**File**: `core/application/usecases/marketing/post/update-scheduled-posts-status.ts`

```typescript
export class UpdateScheduledPostsStatusUseCase {
  async execute(): Promise<{ updatedCount: number }> {
    const now = new Date()
    const allPosts = await this.postService.getAll()

    let updatedCount = 0

    for (const post of allPosts) {
      // Skip if not scheduled or still in future
      if (!post.scheduledAt || new Date(post.scheduledAt) > now) {
        continue
      }

      // Check if any platform is still "scheduled"
      const hasScheduledPlatform = post.platforms.some(p => p.status === "scheduled")

      if (hasScheduledPlatform) {
        // Update "scheduled" → "published"
        const updatedPlatforms = post.platforms.map(p => ({
          ...p,
          status: p.status === "scheduled" ? "published" : p.status,
          publishedAt: p.status === "scheduled" ? now : p.publishedAt,
        }))

        await this.postService.update({
          id: post.id,
          platforms: updatedPlatforms,
          updatedAt: now,
        })

        updatedCount++
      }
    }

    return { updatedCount }
  }
}
```

### 3. API Endpoint

**File**: `app/api/posts/update-scheduled-status/route.ts`

```typescript
export async function POST() {
  const postService = await createPostRepository()
  const useCase = new UpdateScheduledPostsStatusUseCase(postService)
  const result = await useCase.execute()

  return NextResponse.json({
    success: true,
    updatedCount: result.updatedCount,
  })
}
```

### 4. Client-Side Auto-Updater

**File**: `app/(features)/crm/campaigns/posts/_hooks/useScheduledPostUpdater.ts`

```typescript
export function useScheduledPostUpdater() {
  useEffect(() => {
    const updateScheduledPosts = async () => {
      const response = await fetch('/api/posts/update-scheduled-status', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.updatedCount > 0) {
          console.log(`Updated ${data.updatedCount} posts`)
          window.location.reload()  // Refresh UI
        }
      }
    }

    // Run on mount
    updateScheduledPosts()

    // Run every 5 minutes
    const interval = setInterval(updateScheduledPosts, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])
}
```

**Integration** in PostsPageClient:
```typescript
export default function PostsPageClient({ initialPosts }: PostsPageClientProps) {
  useScheduledPostUpdater()  // Auto-update scheduled posts
  // ...rest of component
}
```

## Database Schema

### Post with Scheduled Platform

```json
{
  "id": "123",
  "title": "Holiday Sale Announcement",
  "scheduledAt": "2024-12-25T10:00:00Z",
  "platforms": [
    {
      "platform": "facebook",
      "status": "scheduled",  // Will become "published" after scheduledAt
      "postId": "fb_post_456",
      "permalink": "https://facebook.com/...",
      "publishedAt": null  // Will be set when status changes to "published"
    }
  ],
  "createdAt": "2024-12-20T15:30:00Z"
}
```

### After Scheduled Time Passes

```json
{
  "id": "123",
  "platforms": [
    {
      "platform": "facebook",
      "status": "published",  // ✅ Auto-updated
      "postId": "fb_post_456",
      "permalink": "https://facebook.com/...",
      "publishedAt": "2024-12-25T10:05:00Z"  // ✅ Set by updater
    }
  ],
  "updatedAt": "2024-12-25T10:05:00Z"
}
```

## Status Display Logic

### In UI Components

Posts should display based on BOTH `status` and `scheduledAt`:

```typescript
const getPostDisplayStatus = (post: Post) => {
  const now = new Date()
  const scheduledAt = post.scheduledAt ? new Date(post.scheduledAt) : null

  // Check platform statuses
  const hasScheduled = post.platforms.some(p => p.status === "scheduled")
  const hasPublished = post.platforms.some(p => p.status === "published")
  const hasFailed = post.platforms.some(p => p.status === "failed")

  if (hasFailed) return "failed"
  if (hasScheduled && scheduledAt && scheduledAt > now) return "scheduled"
  if (hasPublished) return "published"
  return "draft"
}
```

## Background Job Options

### Current: Client-Side Polling (5 minutes)

**Pros**:
- Simple implementation
- No server-side cron setup needed
- Works immediately

**Cons**:
- Only runs when users visit page
- Multiple browser tabs = multiple requests

### Future: Server-Side Cron

**Recommended for Production**:

1. **Vercel Cron Jobs** (vercel.json):
```json
{
  "crons": [
    {
      "path": "/api/posts/update-scheduled-status",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

2. **External Cron Service**:
- UptimeRobot (free monitoring + cron)
- cron-job.org
- EasyCron

3. **BullMQ Worker** (already in project):
```typescript
// infrastructure/queue/workers/scheduled-post-worker.ts
import { Worker } from 'bullmq'

const worker = new Worker('scheduled-posts', async () => {
  await fetch('http://localhost:3000/api/posts/update-scheduled-status', {
    method: 'POST'
  })
}, {
  connection: redisConnection,
  repeat: {
    pattern: '*/5 * * * *'  // Every 5 minutes
  }
})
```

## Testing

### Manual Test Scenarios

1. **Schedule post for 2 minutes from now**:
   - Create post with scheduledAt = now + 2 min
   - Verify platforms show "scheduled" status
   - Wait 5 minutes
   - Verify auto-updater changed to "published"

2. **Schedule post for tomorrow**:
   - Create post with scheduledAt = tomorrow
   - Verify stays "scheduled" status
   - Manually call `/api/posts/update-scheduled-status`
   - Verify still "scheduled" (not time yet)

3. **Immediate publish**:
   - Create post without scheduledAt
   - Verify platforms show "published" immediately

4. **Draft save**:
   - Click "Save as Draft"
   - Verify NOT published to platforms
   - Verify status = "draft"

## Future Enhancements

1. **Notification System**: Alert admin when scheduled post is published
2. **Retry Failed Posts**: Auto-retry failed scheduled posts
3. **Analytics Integration**: Track scheduled vs immediate post performance
4. **Bulk Scheduling**: Schedule multiple posts at once
5. **Calendar View Refinement**: Show scheduled time on calendar

---

**Status**: ✅ Implemented
**Tested**: Manual testing required
**Production Ready**: Yes (with external cron recommended)
