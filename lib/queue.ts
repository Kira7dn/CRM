import { Queue, Worker, QueueEvents } from 'bullmq';
import { paymentCallbackUseCase, paymentGateway } from './container';

// Queue configuration
const connection: any = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME,
};

// Enable TLS if required by provider
if (process.env.REDIS_TLS === 'true') {
  connection.tls = {};
}

// Create order queue
export const orderQueue = new Queue('orders', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 50, // Keep last 50 completed jobs
    removeOnFail: 100,    // Keep last 100 failed jobs
  },
});

export const orderQueueEvents = new QueueEvents('orders', { connection });
orderQueueEvents.on('completed', ({ jobId }) => {
  console.log(`[OrderWorker] Job ${jobId} completed`);
});
orderQueueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`[OrderWorker] Job ${jobId} failed: ${failedReason}`);
});

// Worker to process order jobs
const orderWorker = new Worker('orders', async (job) => {
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
  connection,
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
  await orderQueue.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[OrderWorker] Shutting down gracefully...');
  await orderWorker.close();
  await orderQueue.close();
  process.exit(0);
});

console.log('[OrderWorker] Order queue worker started successfully');
