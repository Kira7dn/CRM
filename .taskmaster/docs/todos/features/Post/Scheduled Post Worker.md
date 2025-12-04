# Scheduled Post Worker - TODO

## Vấn đề hiện tại
- ✅ **Đã có**: BullMQ infrastructure, PostingAdapterFactory, CreatePostUseCase
- ❌ **Thiếu**: Worker để publish posts đúng giờ thay vì publish ngay + cron update status
- ❌ **Cần đổi**: Strategy từ "publish immediately" → "delay job publish"

---

## TODO List

### Phase 1: Update CreatePostUseCase
- [ ] **1.1** Inject `QueueService` vào `CreatePostUseCase` constructor
- [ ] **1.2** Thêm logic: Nếu `postStatus === "scheduled"` → `addJob()` thay vì publish ngay
- [ ] **1.3** Calculate delay = `scheduledAt - Date.now()`
- [ ] **1.4** Update `app/api/posts/depends.ts` để inject BullMQAdapter

### Phase 2: Tạo Scheduled Post Worker
- [ ] **2.1** Tạo `infrastructure/queue/scheduled-post-worker.ts`
- [ ] **2.2** Implement worker xử lý job `publish-scheduled-post`
- [ ] **2.3** Sử dụng `PostingAdapterFactory` để publish lên platforms
- [ ] **2.4** Update `PostRepository` với kết quả publish

### Phase 3: Worker Script & Deployment
- [ ] **3.1** Thêm script `worker:scheduled-posts` vào `package.json`
- [ ] **3.2** Update `instrumentation.node.ts` để start worker (optional)
- [ ] **3.3** Tạo `scripts/start-scheduled-post-worker.ts` cho standalone mode

### Phase 4: Cleanup Old Code
- [ ] **4.1** Xóa `app/api/posts/update-scheduled-status/route.ts` (không cần nữa)
- [ ] **4.2** Xóa `UpdateScheduledPostsStatusUseCase` (không cần nữa)
- [ ] **4.3** Xóa `useScheduledPostUpdater` hook (không cần polling UI nữa)
- [ ] **4.4** Update docs `SCHEDULED_POST_PUBLISHING.md`

---

## Code Implementation

### Phase 1: Update CreatePostUseCase

**File: `core/application/usecases/marketing/post/create-post.ts`**

```ts
import type { QueueService } from "@/core/application/interfaces/shared/queue-service"

export class CreatePostUseCase {
  constructor(
    private postService: PostService,
    private queueService: QueueService  // NEW: Inject queue
  ) {}

  async execute(request: CreatePostRequest): Promise<CreatePostResponse> {
    // ... existing logic to determine postStatus

    // Publish to platforms (only if NOT scheduled)
    if (postStatus !== "scheduled") {
      // Existing publish logic
      for (const platformMeta of request.platforms) {
        const adapter = await this.postingFactory.create(platformMeta.platform, request.userId)
        const result = await adapter.publish({ ... })
        platformResults.push(result)
      }
    } else {
      // NEW: Schedule job for later
      const delay = new Date(request.scheduledAt!).getTime() - Date.now()

      await this.queueService.addJob(
        "scheduled-posts",
        "publish-scheduled-post",
        {
          postId: post.id,
          userId: request.userId,
          platforms: request.platforms,
        },
        { delay }
      )

      console.log(`[CreatePostUseCase] Scheduled job for post ${post.id} with delay ${delay}ms`)

      // Mark platforms as scheduled (will be updated by worker)
      platformResults = request.platforms.map(p => ({
        platform: p.platform,
        status: "scheduled" as const,
        postId: null,
        permalink: null,
        publishedAt: null,
        error: null,
      }))
    }

    // ... rest of the code
  }
}
```

**Update: `app/api/posts/depends.ts`**

```ts
import { BullMQAdapter } from "@/infrastructure/queue/bullmq-adapter"

export const createPostUseCase = async (): Promise<CreatePostUseCase> => {
  const postService = await createPostRepository()
  const queueService = new BullMQAdapter()  // NEW

  return new CreatePostUseCase(postService, queueService)
}
```

---

### Phase 2: Scheduled Post Worker

**File: `infrastructure/queue/scheduled-post-worker.ts`** (NEW)

```ts
import 'server-only'
import { Worker, Job, Queue } from 'bullmq'
import Redis from 'ioredis'
import { PostingAdapterFactory } from '@/core/application/interfaces/social/posting-adapter'
import { PostRepository } from '@/infrastructure/repositories/marketing/post-repo'

// Redis connection singleton
const getWorkerRedisConnection = (): Redis => {
  if (!(globalThis as any).__scheduledPostWorkerRedis) {
    (globalThis as any).__scheduledPostWorkerRedis = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    })
  }
  return (globalThis as any).__scheduledPostWorkerRedis
}

// Job data interface
export interface PublishScheduledPostJobData {
  postId: string
  userId: string
  platforms: Array<{
    platform: string
    [key: string]: any
  }>
}

// Queue instance
export const scheduledPostQueue = new Queue('scheduled-posts', {
  connection: getWorkerRedisConnection(),
})

// Worker singleton
let scheduledPostWorkerInstance: Worker | null = null

export const getScheduledPostWorker = (): Worker | null => scheduledPostWorkerInstance

/**
 * Initialize Scheduled Post Worker
 */
export const initializeScheduledPostWorker = (): Worker => {
  if (scheduledPostWorkerInstance) return scheduledPostWorkerInstance

  scheduledPostWorkerInstance = new Worker(
    'scheduled-posts',
    async (job: Job<PublishScheduledPostJobData>) => {
      console.log(`[ScheduledPostWorker] Processing job ${job.id}:`, job.data)

      const { postId, userId, platforms } = job.data

      try {
        const postRepo = new PostRepository()
        const postingFactory = new PostingAdapterFactory()

        // Get post from DB
        const post = await postRepo.findById(postId)
        if (!post) {
          throw new Error(`Post ${postId} not found`)
        }

        // Publish to each platform
        const platformResults = []

        for (const platformMeta of platforms) {
          try {
            const adapter = await postingFactory.create(platformMeta.platform, userId)

            const result = await adapter.publish({
              title: post.title,
              body: post.body,
              media: post.media || [],
              hashtags: post.hashtags || [],
              mentions: post.mentions || [],
            })

            platformResults.push({
              platform: platformMeta.platform,
              status: result.success ? 'published' : 'failed',
              postId: result.postId,
              permalink: result.permalink,
              publishedAt: result.success ? new Date() : null,
              error: result.error || null,
            })

            console.log(`[ScheduledPostWorker] Published to ${platformMeta.platform}:`, result)
          } catch (error) {
            platformResults.push({
              platform: platformMeta.platform,
              status: 'failed',
              postId: null,
              permalink: null,
              publishedAt: null,
              error: error instanceof Error ? error.message : String(error),
            })

            console.error(`[ScheduledPostWorker] Failed to publish to ${platformMeta.platform}:`, error)
          }
        }

        // Update post in DB with results
        await postRepo.update({
          id: postId,
          platforms: platformResults as any,
          updatedAt: new Date(),
        })

        console.log(`[ScheduledPostWorker] Job ${job.id} completed for post ${postId}`)
      } catch (error) {
        console.error(`[ScheduledPostWorker] Job ${job.id} failed:`, error)
        throw error // BullMQ will retry
      }
    },
    {
      connection: getWorkerRedisConnection(),
      concurrency: 5, // Process 5 jobs concurrently
    }
  )

  // Event listeners
  scheduledPostWorkerInstance.on('completed', (job) => {
    console.log(`[ScheduledPostWorker] Job ${job.id} completed`)
  })

  scheduledPostWorkerInstance.on('failed', (job, error) => {
    console.error(`[ScheduledPostWorker] Job ${job?.id} failed:`, error)
  })

  console.log('[ScheduledPostWorker] Worker initialized')

  return scheduledPostWorkerInstance
}

/**
 * Graceful shutdown
 */
export const closeScheduledPostWorker = async (): Promise<void> => {
  if (scheduledPostWorkerInstance) {
    await scheduledPostWorkerInstance.close()
    scheduledPostWorkerInstance = null
    console.log('[ScheduledPostWorker] Worker closed')
  }
}
```

---

### Phase 3: Worker Scripts

**File: `scripts/start-scheduled-post-worker.ts`** (NEW)

```ts
#!/usr/bin/env tsx

/**
 * Standalone script to run Scheduled Post Worker
 * Usage: npm run worker:scheduled-posts
 */

import { initializeScheduledPostWorker, closeScheduledPostWorker } from '../infrastructure/queue/scheduled-post-worker'

console.log('[ScheduledPostWorker] Starting worker...')

// Initialize worker
const worker = initializeScheduledPostWorker()

// Graceful shutdown
const shutdown = async () => {
  console.log('[ScheduledPostWorker] Shutting down...')
  await closeScheduledPostWorker()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

console.log('[ScheduledPostWorker] Worker is running. Press Ctrl+C to stop.')
```

**Update: `package.json`**

```json
{
  "scripts": {
    "worker:scheduled-posts": "tsx scripts/start-scheduled-post-worker.ts"
  }
}
```

**Optional - Update: `instrumentation.node.ts`**

```ts
import { initializeScheduledPostWorker } from './infrastructure/queue/scheduled-post-worker'

export async function register() {
  if (process.env.ENABLE_SCHEDULED_POST_WORKER === 'true') {
    console.log('[Instrumentation] Initializing Scheduled Post Worker...')
    initializeScheduledPostWorker()
  }
}
```

---

## Migration Strategy

### Before Migration (Current State)
```
User schedules post
    ↓
Post published IMMEDIATELY to platforms
    ↓
Saved to DB with status="scheduled"
    ↓
Cron job updates status every 5 minutes
```

### After Migration (Worker-based)
```
User schedules post
    ↓
Saved to DB with status="scheduled"
    ↓
BullMQ job created with delay
    ↓
Worker publishes at scheduled time
    ↓
DB updated with publish results
```

### Benefits
- ✅ True scheduled publishing (không publish ngay)
- ✅ Retry mechanism tự động (BullMQ built-in)
- ✅ Không cần cron job
- ✅ Scalable (multiple workers)
- ✅ Job persistence (Redis)

---

## Testing

```bash
# Start worker
npm run worker:scheduled-posts

# Create a scheduled post (scheduledAt = 2 minutes from now)
# Check BullMQ dashboard or logs

# Verify:
# - Job appears in Redis
# - Worker processes job after delay
# - Post published to platforms
# - DB updated correctly
```

---

## Environment Variables

```env
# Redis (already configured)
REDIS_URL=redis://...

# Optional: Auto-start worker with Next.js
ENABLE_SCHEDULED_POST_WORKER=true
```

---

## Deployment Notes

- **Production**: Run worker as separate process (pm2, Docker, etc.)
- **Development**: Use `npm run worker:scheduled-posts`
- **Kubernetes**: Deploy as separate Deployment with auto-scaling
- **Vercel**: Worker không chạy được trên Vercel (cần separate server)

---

## Độ ưu tiên

1. **Phase 1** - Update CreatePostUseCase (critical)
2. **Phase 2** - Implement Worker (critical)
3. **Phase 3** - Scripts & deployment
4. **Phase 4** - Cleanup old code
