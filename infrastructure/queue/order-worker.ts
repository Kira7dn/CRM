import 'server-only';
import { Queue } from 'bullmq';
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
export type OrderJobType = 'checkPaymentStatus';

export interface CheckPaymentJobData {
  orderId: string;
  checkoutSdkOrderId: string;
  miniAppId: string;
}

// -----------------------------
// Queue instance
// -----------------------------
export const orderQueue = new Queue('orders', {
  connection: getRedisConnection(),
});

// -----------------------------
// Helper to enqueue jobs
// -----------------------------
export const addCheckPaymentJob = (data: CheckPaymentJobData) =>
  orderQueue.add('checkPaymentStatus', { type: 'checkPaymentStatus', data });

// -----------------------------
// Worker Implementation
// -----------------------------
import { Worker, Job } from 'bullmq';
import type { PaymentGateway } from '@/core/application/interfaces/payment-gateway';

// -----------------------------
// Lazy Redis singleton for workers
// -----------------------------
const getWorkerRedisConnection = (): Redis => {
  if (!(globalThis as any).__workerRedisConnection) {
    (globalThis as any).__workerRedisConnection = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
  }
  return (globalThis as any).__workerRedisConnection;
};

// -----------------------------
// Worker singleton
// -----------------------------
let orderWorkerInstance: Worker | null = null;
export const getOrderWorker = (): Worker | null => orderWorkerInstance;

// -----------------------------
// Worker initialization (internal)
// -----------------------------
const initializeOrderWorkerInternal = (paymentGateway: PaymentGateway): Worker => {
  if (orderWorkerInstance) return orderWorkerInstance;

  orderWorkerInstance = new Worker(
    'orders',
    async (job: Job<{ type: OrderJobType; data: CheckPaymentJobData }>) => {
      const { type, data } = job.data;
      console.log(`[OrderWorker] Processing job ${job.id}: ${type}`, { timestamp: new Date(), data });

      switch (type) {
        case 'checkPaymentStatus':
          const { orderId, checkoutSdkOrderId, miniAppId } = data;
          try {
            await paymentGateway.processPaymentUpdate(Number(orderId), checkoutSdkOrderId, miniAppId);
            console.log(`[OrderWorker] Payment status check completed for order ${orderId}`);
          } catch (err) {
            console.error(`[OrderWorker] Failed to check payment for order ${orderId}:`, err);
            throw err;
          }
          break;

        default:
          console.warn(`[OrderWorker] Unknown job type: ${type}`);
          throw new Error(`Unknown job type: ${type}`);
      }
    },
    {
      connection: getWorkerRedisConnection(),
      concurrency: 5,
      limiter: { max: 10, duration: 1000 },
    }
  );

  // Event listeners
  orderWorkerInstance.on('completed', (job) => console.log(`[OrderWorker] Job ${job?.id} completed`));
  orderWorkerInstance.on('failed', (job, err) => console.error(`[OrderWorker] Job ${job?.id} failed:`, err));

  // Graceful shutdown
  const shutdown = async () => {
    console.log('[OrderWorker] Shutting down gracefully...');
    await orderWorkerInstance?.close();
    await getWorkerRedisConnection().quit();
    process.exit(0);
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);

  console.log('[OrderWorker] Worker initialized');
  return orderWorkerInstance;
};

// -----------------------------
// Factory pattern: Create worker factory using injected infrastructure
// -----------------------------
export const createOrderWorkerFactory = (paymentGateway: PaymentGateway) => {
  // Receive infrastructure from Application layer
  return () => initializeOrderWorkerInternal(paymentGateway);
};

// -----------------------------
// Next.js Instrumentation entry with factory
// -----------------------------
export const registerWorkers = (paymentGateway: PaymentGateway) => {
  // Only run in Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const initializeOrderWorker = createOrderWorkerFactory(paymentGateway);
    initializeOrderWorker();
  }
};
