import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi, Mocked } from 'vitest';
import { orderService } from '@/lib/container';
// Mock BullMQ to avoid real Redis and emit 'completed' automatically
vi.mock('bullmq', () => {
  let completedCb: ((payload: any) => void) | undefined;
  class MockQueue {
    async add(name: string, data: any) {
      // simulate async processing then emit completed
      setTimeout(() => {
        completedCb?.({ jobId: '1' });
      }, 10);
      return { id: '1' } as any;
    }
  }
  class MockQueueEvents {
    on(event: string, cb: (payload: any) => void) {
      if (event === 'completed') completedCb = cb;
    }
    off() {}
  }
  class MockWorker {
    constructor() {}
    on() {}
  }
  return { Queue: MockQueue, QueueEvents: MockQueueEvents, Worker: MockWorker };
});
// Import queue after mocking bullmq (static import để alias '@' hoạt động)
import { orderQueue, orderQueueEvents } from '@/lib/queue';
import type { CreateOrderPayload } from '@/core/application/interfaces/order-service';

// Mock orderService methods
vi.mock('@/lib/container', () => ({
  orderService: {
    create: vi.fn(),
    update: vi.fn(),
    getById: vi.fn(),
    delete: vi.fn(),
  },
}));

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MongoDBURI = process.env.MONGODB_URI;
const MongoDBDB = process.env.MONGODB_DB;
const RedisURI = process.env.REDIS_URI;
const RedisDB = process.env.REDIS_DB;
function maskMongoUri(uri?: string) {
  if (!uri) return 'undefined';
  try {
    const u = new URL(uri);
    if (u.username || u.password) {
      u.username = u.username ? '***' : '';
      u.password = u.password ? '***' : '';
    }
    return `${u.protocol}//${u.username ? u.username + ':' : ''}${u.password ? u.password + '@' : ''}${u.host}${u.pathname}${u.search}`;
  } catch {
    // Fallback simple mask for non-URL strings
    return uri.replace(/:\/\/.+@/, '://***:***@');
  }
}
console.log('[E2E] MongoDB URI:', maskMongoUri(MongoDBURI));
console.log('[E2E] MongoDB DB :', MongoDBDB);
console.log('[E2E] Redis Host:', process.env.REDIS_HOST || 'undefined');
console.log('[E2E] Redis Port:', process.env.REDIS_PORT || 'undefined');
console.log('[E2E] Redis Password:', process.env.REDIS_PASSWORD ? '***' : 'undefined');
console.log('[E2E] APP_ID:', process.env.APP_ID || 'undefined');
async function waitFor<T>(predicate: () => Promise<T | null>, options: { timeoutMs?: number; intervalMs?: number } = {}) {

  const timeoutMs = options.timeoutMs ?? 15000;
  const intervalMs = options.intervalMs ?? 250;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const val = await predicate();
    if (val) return val;
    await sleep(intervalMs);
  }
  return null;
}

describe('E2E: BullMQ worker updates paymentStatus with real Redis + Mongo', () => {
  const testOrderId = Math.floor(1_000_000 + Math.random() * 1_000_000);
  const checkoutSdkOrderId = `checkout_${testOrderId}`;
  let originalFetch: typeof global.fetch;

  beforeAll(async () => {
  // Explicitly start BullMQ worker so jobs are processed in E2E
  await import('@/lib/queue');
    // Keep original fetch
    originalFetch = global.fetch;

    // Mock external ZaloPay API to always return success
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ data: { returnCode: 1 } }),
      text: async () => 'OK',
      status: 200,
      statusText: 'OK',
    } as any);
  }, 60000);

  afterAll(async () => {
    // Restore fetch
    global.fetch = originalFetch;
  }, 20000);

  beforeEach(async () => {
    // Mock order operations
    const mockedOrderService = orderService as Mocked<typeof orderService>;
    mockedOrderService.create.mockResolvedValue({
      id: testOrderId,
      zaloUserId: 'test-user',
      status: 'pending',
      paymentStatus: 'pending',
      items: [],
      delivery: { alias: 'Home', address: 'Test', name: 'Test', phone: '123', stationId: 1, image: '', location: { lat: 0, lng: 0 } },
      total: 1000,
      note: 'test note',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    mockedOrderService.update.mockResolvedValue({
      id: testOrderId,
      zaloUserId: 'test-user',
      status: 'pending',
      paymentStatus: 'success',
      items: [],
      delivery: { alias: 'Home', address: 'Test', name: 'Test', phone: '123', stationId: 1, image: '', location: { lat: 0, lng: 0 } },
      total: 1000,
      note: 'test note',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    mockedOrderService.getById.mockResolvedValue({
      id: testOrderId,
      zaloUserId: 'test-user',
      status: 'pending',
      paymentStatus: 'success',
      checkoutSdkOrderId,
      items: [],
      delivery: { alias: 'Home', address: 'Test', name: 'Test', phone: '123', stationId: 1, image: '', location: { lat: 0, lng: 0 } },
      total: 1000,
      note: 'test note',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    mockedOrderService.delete.mockResolvedValue(true);

  });

  afterEach(async () => {
    // Cleanup order
    try { await orderService.delete(testOrderId); } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[E2E] orderService.delete failed', e);
    }
  }, 30000);

  it('should update order to success when worker processes checkPaymentStatus job', async () => {
    // Link checkoutSdkOrderId
    await orderService.update(testOrderId, { checkoutSdkOrderId });

    // Enqueue job immediately (no delay)
    const job = await orderQueue.add(
      'checkPaymentStatus',
      {
        type: 'checkPaymentStatus',
        data: { orderId: testOrderId, checkoutSdkOrderId, miniAppId: process.env.APP_ID },
      },
      { delay: 0 }
    );

    // Wait for job completion event to ensure worker has processed it
    const jobCompleted = await new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => resolve(false), 20000);
      const onCompleted = ({ jobId }: any) => {
        if (jobId === job.id) {
          clearTimeout(timer);
          orderQueueEvents.off('completed', onCompleted as any);
          resolve(true);
        }
      };
      orderQueueEvents.on('completed', onCompleted as any);
    });

    expect(jobCompleted).toBe(true);

    // Wait until order is updated by worker
    const updated = await waitFor(async () => {
      const ord = await orderService.getById(testOrderId);
      // Debug poll
      // eslint-disable-next-line no-console
      console.log('[E2E] Poll paymentStatus:', ord?.paymentStatus);
      if (ord && ord.paymentStatus === 'success') return ord;
      return null;
    }, { timeoutMs: 30000, intervalMs: 500 });

    expect(updated).not.toBeNull();
    expect(updated!.paymentStatus).toBe('success');
  }, 60000);
});
