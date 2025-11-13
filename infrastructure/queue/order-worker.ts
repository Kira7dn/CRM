import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { paymentGateway } from '@/lib/container';

// Lazy initialization of Redis connection
const getRedisConnection = (): Redis => {
  if (!(globalThis as any).__workerRedisConnection) {
    (globalThis as any).__workerRedisConnection = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: null, // BullMQ requires this to be null
      lazyConnect: true,
    });
  }
  return (globalThis as any).__workerRedisConnection;
};

// Worker to process order jobs
export const orderWorker = new Worker('orders', async (job) => {
  const { type, data } = job.data;

  console.log(`[OrderWorker] Processing job ${job.id}: ${type}`, {
    timestamp: new Date().toISOString(),
    data
  });

  switch (type) {
    case 'checkPaymentStatus':
      const { orderId, checkoutSdkOrderId, miniAppId } = data;

      try {
        console.log(`[OrderWorker] Checking payment status for order ${orderId}`);

        // Call payment gateway to check status and update order
        await paymentGateway.processPaymentUpdate(orderId, checkoutSdkOrderId, miniAppId);

        console.log(`[OrderWorker] Payment status check completed for order ${orderId}`, {
          checkoutSdkOrderId,
          miniAppId
        });

      } catch (error) {
        console.error(`[OrderWorker] Failed to check payment for order ${orderId}:`, error);
        throw error; // Re-throw to mark job as failed
      }
      break;

    default:
      console.warn(`[OrderWorker] Unknown job type: ${type}`);
      throw new Error(`Unknown job type: ${type}`);
  }
}, {
  connection: getRedisConnection(),
  concurrency: 5, // Process up to 5 jobs simultaneously
  limiter: {
    max: 10,    // Max 10 jobs
    duration: 1000, // per second
  },
});

// Event listeners for monitoring
orderWorker.on('completed', (job) => {
  console.log(`[OrderWorker] Job ${job?.id} completed successfully`);
});

orderWorker.on('failed', (job, err) => {
  console.error(`[OrderWorker] Job ${job?.id || 'unknown'} failed:`, err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[OrderWorker] Shutting down gracefully...');
  await orderWorker.close();
  await getRedisConnection().quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[OrderWorker] Shutting down gracefully...');
  await orderWorker.close();
  await getRedisConnection().quit();
  process.exit(0);
});

console.log('[OrderWorker] Order queue worker started successfully');
