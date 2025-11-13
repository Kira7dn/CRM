import { Queue, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

// Lazy initialization of Redis connection
const getRedisConnection = (): Redis => {
  if (!(globalThis as any).__orderRedisConnection) {
    (globalThis as any).__orderRedisConnection = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: null, // BullMQ requires this to be null
      lazyConnect: true,
    });
  }
  return (globalThis as any).__orderRedisConnection;
};

// Create order queue
export const orderQueue = new Queue('orders', {
  connection: getRedisConnection(),
  defaultJobOptions: {
    removeOnComplete: 50, // Keep last 50 completed jobs
    removeOnFail: 100,    // Keep last 100 failed jobs
  },
});

export const orderQueueEvents = new QueueEvents('orders', { connection: getRedisConnection() });
orderQueueEvents.on('completed', ({ jobId }) => {
  console.log(`[OrderWorker] Job ${jobId} completed`);
});
orderQueueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`[OrderWorker] Job ${jobId} failed: ${failedReason}`);
});
