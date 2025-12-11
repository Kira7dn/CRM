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
export type WordPressJobType = 'publishPost' | 'updatePost' | 'refreshToken';

export interface PublishPostJobData {
  userId: string;
  post: {
    title: string;
    content: string;
    status?: "publish" | "draft" | "pending" | "private";
    excerpt?: string;
    featured_media?: number;
    categories?: number[];
    tags?: number[];
  };
}

export interface UpdatePostJobData {
  userId: string;
  postId: number;
  post: {
    title?: string;
    content?: string;
    status?: "publish" | "draft" | "pending" | "private";
    excerpt?: string;
    featured_media?: number;
    categories?: number[];
    tags?: number[];
  };
}

export interface RefreshTokenJobData {
  userId: string;
  platform: 'wordpress';
}

// -----------------------------
// Queue instance
// -----------------------------
export const wordpressQueue = new Queue('wordpress-publish', {
  connection: getRedisConnection(),
});

// -----------------------------
// Helper to enqueue jobs
// -----------------------------
export const addPublishPostJob = (data: PublishPostJobData) =>
  wordpressQueue.add('publishPost', { type: 'publishPost', data }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });

export const addUpdatePostJob = (data: UpdatePostJobData) =>
  wordpressQueue.add('updatePost', { type: 'updatePost', data }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });

export const addRefreshTokenJob = (data: RefreshTokenJobData) =>
  wordpressQueue.add('refreshToken', { type: 'refreshToken', data }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });

// -----------------------------
// Schedule recurring token refresh check
// -----------------------------
export const scheduleTokenRefreshCheck = async () => {
  // Check for expiring tokens every day at midnight
  await wordpressQueue.add(
    'checkExpiringTokens',
    { type: 'checkExpiringTokens', data: {} },
    {
      repeat: {
        pattern: '0 0 * * *', // Every day at midnight
      },
      jobId: 'wordpress-token-refresh-check',
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
let wordpressWorkerInstance: Worker | null = null;
export const getWordPressWorker = (): Worker | null => wordpressWorkerInstance;

// Worker initialization
export const initializeWordPressWorker = (): Worker => {
  if (wordpressWorkerInstance) return wordpressWorkerInstance;

  wordpressWorkerInstance = new Worker(
    'wordpress-publish',
    async (job: Job) => {
      const { type, data } = job.data;
      console.log(`[WordPressWorker] Processing job ${job.id}: ${type}`, { timestamp: new Date(), data });

      switch (type) {
        case 'publishPost':
          await handlePublishPost(data as PublishPostJobData);
          break;

        case 'updatePost':
          await handleUpdatePost(data as UpdatePostJobData);
          break;

        case 'refreshToken':
          await handleRefreshToken(data as RefreshTokenJobData);
          break;

        case 'checkExpiringTokens':
          await handleCheckExpiringTokens();
          break;

        default:
          console.warn(`[WordPressWorker] Unknown job type: ${type}`);
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

  wordpressWorkerInstance.on('completed', (job) => {
    console.log(`[WordPressWorker] Job ${job.id} completed successfully`);
  });

  wordpressWorkerInstance.on('failed', (job, err) => {
    console.error(`[WordPressWorker] Job ${job?.id} failed:`, err.message);
  });

  console.log('[WordPressWorker] Worker initialized');
  return wordpressWorkerInstance;
};

// Graceful shutdown
export const shutdownWordPressWorker = async () => {
  if (wordpressWorkerInstance) {
    console.log('[WordPressWorker] Shutting down worker...');
    await wordpressWorkerInstance.close();
    wordpressWorkerInstance = null;
  }
};

// -----------------------------
// Job Handlers
// -----------------------------

/**
 * Handle publishing a post to WordPress
 */
async function handlePublishPost(data: PublishPostJobData) {
  try {
    const { publishWordPressPostUseCase } = await import("@/app/api/social/wordpress/publish/depends");

    const useCase = await publishWordPressPostUseCase();
    const result = await useCase.execute(data);

    if (!result.success) {
      throw new Error(result.error || "Failed to publish post");
    }

    console.log(`[WordPressWorker] Successfully published post for user ${data.userId}`, {
      wordpressPostId: result.wordpressPostId,
    });
  } catch (error) {
    console.error(`[WordPressWorker] Error publishing post for user ${data.userId}:`, error);
    throw error; // Re-throw to trigger retry
  }
}

/**
 * Handle updating a WordPress post
 */
async function handleUpdatePost(data: UpdatePostJobData) {
  try {
    const { getPostingAdapterFactory } = await import("@/infrastructure/adapters/external/social/factories/posting-adapter-factory");
    const { SocialAuthRepository } = await import("@/infrastructure/repositories/social/social-auth-repo");
    const { ObjectId } = await import("mongodb");

    const repo = new SocialAuthRepository();
    const auth = await repo.getByUserAndPlatform(new ObjectId(data.userId), "wordpress");

    if (!auth) {
      throw new Error("No WordPress authentication found");
    }

    // Create adapter using factory
    const factory = getPostingAdapterFactory();
    const adapter = await factory.create("wordpress", data.userId);

    // Convert job data to update request
    const updateRequest = {
      title: data.post.title || "Untitled",
      body: data.post.content || "",
      hashtags: [],
      mentions: [],
      media: [],
    };

    const result = await adapter.update(data.postId.toString(), updateRequest);

    console.log(`[WordPressWorker] Successfully updated post ${data.postId} for user ${data.userId}`);
  } catch (error) {
    console.error(`[WordPressWorker] Error updating post for user ${data.userId}:`, error);
    throw error;
  }
}

/**
 * Handle token refresh for a specific user
 */
async function handleRefreshToken(data: RefreshTokenJobData) {
  try {
    const { SocialAuthRepository } = await import("@/infrastructure/repositories/social/social-auth-repo");
    const { WordPressAuthService } = await import("../adapters/external/social/auth/wordpress-auth-service");
    const { ObjectId } = await import("mongodb");

    const repo = new SocialAuthRepository();
    const auth = await repo.getByUserAndPlatform(new ObjectId(data.userId), "wordpress");

    if (!auth) {
      console.warn(`[WordPressWorker] No WordPress auth found for user ${data.userId}`);
      return;
    }

    // Check if token is close to expiration (within 7 days)
    const now = new Date();
    const daysUntilExpiry = Math.floor((auth.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry > 7) {
      console.log(`[WordPressWorker] Token for user ${data.userId} is not expiring soon (${daysUntilExpiry} days left)`);
      return;
    }

    console.log(`[WordPressWorker] Checking token for user ${data.userId} (expires in ${daysUntilExpiry} days)`);

    // Jetpack OAuth tokens don't expire, so just verify auth is still valid
    const authService = new WordPressAuthService({
      accessToken: auth.accessToken,
      siteUrl: auth.pageName, // blog_url from Jetpack
      blogId: auth.openId, // blog_id from Jetpack
    });

    // Verify auth is still valid
    const isValid = await authService.verifyAuth();

    if (isValid) {
      console.log(`[WordPressWorker] Token is still valid for user ${data.userId}`);
      // Update expiresAt to extend it another year
      await repo.refreshToken({
        userId: auth.userId,
        platform: "wordpress",
        newAccessToken: auth.accessToken, // Same token (Jetpack tokens are permanent)
        newRefreshToken: "", // No refresh token needed
        expiresInSeconds: 365 * 24 * 60 * 60, // 1 year
      });

      console.log(`[WordPressWorker] Successfully refreshed token for user ${data.userId}`);
    } else {
      console.error(`[WordPressWorker] Failed to refresh token for user ${data.userId}`);
    }
  } catch (error) {
    console.error(`[WordPressWorker] Error refreshing token for user ${data.userId}:`, error);
    throw error; // Re-throw to trigger retry
  }
}

/**
 * Check for all expiring tokens and schedule refresh jobs
 */
async function handleCheckExpiringTokens() {
  try {
    const { SocialAuthRepository } = await import("@/infrastructure/repositories/social/social-auth-repo");

    const repo = new SocialAuthRepository();
    const allWordPressAuths = await repo.getAllByPlatform("wordpress");

    console.log(`[WordPressWorker] Checking ${allWordPressAuths.length} WordPress tokens for expiration`);

    const now = new Date();
    let expiringCount = 0;

    for (const auth of allWordPressAuths) {
      // Check if token expires within 7 days
      const daysUntilExpiry = Math.floor((auth.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry <= 7 && daysUntilExpiry >= 0) {
        console.log(`[WordPressWorker] Scheduling refresh for user ${auth.userId.toString()} (expires in ${daysUntilExpiry} days)`);

        await addRefreshTokenJob({
          userId: auth.userId.toString(),
          platform: "wordpress",
        });

        expiringCount++;
      }
    }

    console.log(`[WordPressWorker] Scheduled refresh for ${expiringCount} expiring tokens`);
  } catch (error) {
    console.error("[WordPressWorker] Error checking expiring tokens:", error);
    throw error;
  }
}
