import 'server-only';
import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

// -----------------------------
// Redis connection singleton for queues
// -----------------------------
const getRedisConnection = (): Redis => {
  if (!(globalThis as any).__queueRedis) {
    (globalThis as any).__queueRedis = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
  }
  return (globalThis as any).__queueRedis;
};

// -----------------------------
// Job types
// -----------------------------
export type TikTokJobType = 'refreshToken' | 'syncAnalytics';

export interface RefreshTokenJobData {
  userId: string;
  platform: 'tiktok';
}

export interface SyncAnalyticsJobData {
  userId: string;
  postId: string;
}

// -----------------------------
// Queue instance
// -----------------------------
export const tiktokQueue = new Queue('tiktok', {
  connection: getRedisConnection(),
});

// -----------------------------
// Helper to enqueue jobs
// -----------------------------
export const addRefreshTokenJob = (data: RefreshTokenJobData) =>
  tiktokQueue.add('refreshToken', { type: 'refreshToken', data }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });

export const addSyncAnalyticsJob = (data: SyncAnalyticsJobData) =>
  tiktokQueue.add('syncAnalytics', { type: 'syncAnalytics', data }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });

// -----------------------------
// Schedule recurring token refresh check
// -----------------------------
export const scheduleTokenRefreshCheck = async () => {
  // Check for expiring tokens every hour
  await tiktokQueue.add(
    'checkExpiringTokens',
    { type: 'checkExpiringTokens', data: {} },
    {
      repeat: {
        pattern: '0 * * * *', // Every hour
      },
      jobId: 'tiktok-token-refresh-check',
    }
  );
};

// -----------------------------
// Worker Implementation
// -----------------------------

// Lazy Redis singleton for workers
const getWorkerRedisConnection = (): Redis => {
  if (!(globalThis as any).__workerRedisConnection) {
    (globalThis as any).__workerRedisConnection = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
  }
  return (globalThis as any).__workerRedisConnection;
};

// Worker singleton
let tiktokWorkerInstance: Worker | null = null;
export const getTikTokWorker = (): Worker | null => tiktokWorkerInstance;

// Worker initialization
export const initializeTikTokWorker = (): Worker => {
  if (tiktokWorkerInstance) return tiktokWorkerInstance;

  tiktokWorkerInstance = new Worker(
    'tiktok',
    async (job: Job) => {
      const { type, data } = job.data;
      console.log(`[TikTokWorker] Processing job ${job.id}: ${type}`, { timestamp: new Date(), data });

      switch (type) {
        case 'refreshToken':
          await handleRefreshToken(data as RefreshTokenJobData);
          break;

        case 'syncAnalytics':
          await handleSyncAnalytics(data as SyncAnalyticsJobData);
          break;

        case 'checkExpiringTokens':
          await handleCheckExpiringTokens();
          break;

        default:
          console.warn(`[TikTokWorker] Unknown job type: ${type}`);
      }
    },
    {
      connection: getWorkerRedisConnection(),
      autorun: true,
      concurrency: 5,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    }
  );

  tiktokWorkerInstance.on('completed', (job) => {
    console.log(`[TikTokWorker] Job ${job.id} completed successfully`);
  });

  tiktokWorkerInstance.on('failed', (job, err) => {
    console.error(`[TikTokWorker] Job ${job?.id} failed:`, err.message);
  });

  console.log('[TikTokWorker] Worker initialized');
  return tiktokWorkerInstance;
};

// Graceful shutdown
export const shutdownTikTokWorker = async () => {
  if (tiktokWorkerInstance) {
    console.log('[TikTokWorker] Shutting down worker...');
    await tiktokWorkerInstance.close();
    tiktokWorkerInstance = null;
  }
};

// -----------------------------
// Job Handlers
// -----------------------------

/**
 * Handle token refresh for a specific user
 */
async function handleRefreshToken(data: RefreshTokenJobData) {
  try {
    const { SocialAuthRepository } = await import("@/infrastructure/repositories/social-auth-repo");
    const { refreshTikTokToken } = await import("@/infrastructure/adapters/socials/tiktok-integration");
    const { createRefreshTikTokTokenUseCase } = await import("@/app/api/auth/tiktok/depends");
    const { ObjectId } = await import("mongodb");

    const repo = new SocialAuthRepository();
    const auth = await repo.getByUserAndPlatform(new ObjectId(data.userId), "tiktok");

    if (!auth) {
      console.warn(`[TikTokWorker] No TikTok auth found for user ${data.userId}`);
      return;
    }

    // Check if token is close to expiration (within 7 days)
    const now = new Date();
    const daysUntilExpiry = Math.floor((auth.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry > 7) {
      console.log(`[TikTokWorker] Token for user ${data.userId} is not expiring soon (${daysUntilExpiry} days left)`);
      return;
    }

    console.log(`[TikTokWorker] Refreshing token for user ${data.userId} (expires in ${daysUntilExpiry} days)`);

    // Refresh the token
    const newTokenData = await refreshTikTokToken(auth.refreshToken);

    if (!newTokenData) {
      console.error(`[TikTokWorker] Failed to refresh token for user ${data.userId}`);
      return;
    }

    // Update the token in database
    const useCase = await createRefreshTikTokTokenUseCase();
    const result = await useCase.execute({
      userId: new ObjectId(data.userId),
      newAccessToken: newTokenData.access_token,
      newRefreshToken: newTokenData.refresh_token,
      expiresInSeconds: newTokenData.expires_in,
    });

    if (result.success) {
      console.log(`[TikTokWorker] Successfully refreshed token for user ${data.userId}`);
    } else {
      console.error(`[TikTokWorker] Failed to save refreshed token for user ${data.userId}:`, result.message);
    }
  } catch (error) {
    console.error(`[TikTokWorker] Error refreshing token for user ${data.userId}:`, error);
    throw error; // Re-throw to trigger retry
  }
}

/**
 * Handle analytics sync for a specific post
 */
async function handleSyncAnalytics(data: SyncAnalyticsJobData) {
  try {
    const { createTikTokIntegrationForUser } = await import("@/infrastructure/adapters/socials/tiktok-integration");

    const integration = await createTikTokIntegrationForUser(data.userId);
    const metrics = await integration.getMetrics(data.postId);

    console.log(`[TikTokWorker] Synced analytics for post ${data.postId}:`, metrics);

    // TODO: Update post metrics in database
    // This would require a PostRepository method to update metrics
  } catch (error) {
    console.error(`[TikTokWorker] Error syncing analytics for post ${data.postId}:`, error);
    throw error;
  }
}

/**
 * Check for all expiring tokens and schedule refresh jobs
 */
async function handleCheckExpiringTokens() {
  try {
    const { SocialAuthRepository } = await import("@/infrastructure/repositories/social-auth-repo");

    const repo = new SocialAuthRepository();
    const allTikTokAuths = await repo.getAllByPlatform("tiktok");

    console.log(`[TikTokWorker] Checking ${allTikTokAuths.length} TikTok tokens for expiration`);

    const now = new Date();
    const expiringCount = 0;

    for (const auth of allTikTokAuths) {
      // Check if token expires within 7 days
      const daysUntilExpiry = Math.floor((auth.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry <= 7 && daysUntilExpiry >= 0) {
        console.log(`[TikTokWorker] Scheduling refresh for user ${auth.userId.toString()} (expires in ${daysUntilExpiry} days)`);

        await addRefreshTokenJob({
          userId: auth.userId.toString(),
          platform: "tiktok",
        });
      }
    }

    console.log(`[TikTokWorker] Scheduled refresh for ${expiringCount} expiring tokens`);
  } catch (error) {
    console.error("[TikTokWorker] Error checking expiring tokens:", error);
    throw error;
  }
}
