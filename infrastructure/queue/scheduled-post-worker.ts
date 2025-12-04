import 'server-only'
import { Worker, Job, Queue } from 'bullmq'
import Redis from 'ioredis'
import { PostingAdapterFactory } from '@/core/application/interfaces/social/posting-adapter'
import { PostRepository } from '@/infrastructure/repositories/marketing/post-repo'
import { getPostingAdapterFactory } from '@/infrastructure/adapters/external/social/factories/posting-adapter-factory'
import type { Platform } from '@/core/domain/marketing/post'

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

  const platformFactory = getPostingAdapterFactory()

  scheduledPostWorkerInstance = new Worker(
    'scheduled-posts',
    async (job: Job<PublishScheduledPostJobData>) => {
      console.log(`[ScheduledPostWorker] Processing job ${job.id}:`, job.data)

      const { postId, userId, platforms } = job.data

      try {
        const postRepo = new PostRepository()

        // Get post from DB
        const post = await postRepo.getById(postId)
        if (!post) {
          throw new Error(`Post ${postId} not found`)
        }

        // Publish to each platform
        const platformResults = []

        for (const platformMeta of platforms) {
          try {
            const adapter = await platformFactory.create(platformMeta.platform as Platform, userId)

            const result = await adapter.publish({
              title: post.title ?? '',
              body: post.body,
              media: post.media ?? [],
              hashtags: post.hashtags ?? [],
              mentions: post.mentions ?? [],
            })

            platformResults.push({
              platform: platformMeta.platform,
              status: result.success ? 'published' : 'failed',
              postId: result.postId,
              permalink: result.permalink,
              publishedAt: result.success ? new Date() : undefined,
              error: result.error || undefined,
            })

            console.log(`[ScheduledPostWorker] Published to ${platformMeta.platform}:`, result)
          } catch (error) {
            platformResults.push({
              platform: platformMeta.platform,
              status: 'failed',
              postId: undefined,
              permalink: undefined,
              publishedAt: undefined,
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
