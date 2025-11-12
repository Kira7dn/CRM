import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi, Mocked } from 'vitest';

// Mock external dependencies
vi.mock('@/infrastructure/db/mongo', () => ({
  default: Promise.resolve({
    db: () => ({
      collection: () => ({
        findOne: vi.fn(),
        updateOne: vi.fn(),
        insertOne: vi.fn(),
      }),
    }),
  }),
}));

// Mock Redis/BullMQ to prevent actual connections
vi.mock('bullmq', () => ({
  Queue: vi.fn().mockImplementation(() => ({
    add: vi.fn().mockResolvedValue({ id: 'mock-job-id' }),
    close: vi.fn().mockResolvedValue(undefined),
  })),
  Worker: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    close: vi.fn().mockResolvedValue(undefined),
  })),
}));

// Mock environment variables
vi.mock('process', () => ({
  env: {
    CHECKOUT_SDK_PRIVATE_KEY: 'test_private_key',
    APP_ID: 'test_app_id',
  },
}));

// Helper to create mock Order
const createMockOrder = (overrides: Partial<any> = {}): any => ({
  id: 123,
  zaloUserId: 'user_123',
  checkoutSdkOrderId: null,
  status: 'pending' as const,
  paymentStatus: 'pending' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [],
  delivery: {
    alias: 'Home',
    address: '123 Test St',
    name: 'Test User',
    phone: '123456789',
    stationId: 1,
    image: 'image.jpg',
    location: { lat: 10.5, lng: 106.5 }
  },
  total: 100000,
  note: 'Test order',
  ...overrides
});

// Mock infrastructure implementations (relative paths)
vi.mock('../../infrastructure/gateways/zalopay-gateway', () => ({
  ZaloPayGateway: vi.fn().mockImplementation(() => ({
    checkPaymentStatus: vi.fn(),
    processPaymentUpdate: vi.fn(),
  })),
}));

vi.mock('../../infrastructure/queue/bullmq-adapter', () => ({
  BullMQAdapter: vi.fn().mockImplementation(() => ({
    addJob: vi.fn(),
    close: vi.fn(),
    closeAll: vi.fn(),
  })),
}));

// Mock infrastructure implementations (alias paths) to match imports inside app code
vi.mock('@/infrastructure/gateways/zalopay-gateway', () => ({
  ZaloPayGateway: vi.fn().mockImplementation(() => ({
    checkPaymentStatus: vi.fn(),
    processPaymentUpdate: vi.fn(),
  })),
}));

vi.mock('@/infrastructure/queue/bullmq-adapter', () => ({
  BullMQAdapter: vi.fn().mockImplementation(() => ({
    addJob: vi.fn(),
    close: vi.fn(),
    closeAll: vi.fn(),
  })),
}));

// Mock lib dependencies (relative + alias)
vi.mock('../../lib/queue', () => ({}));
vi.mock('@/lib/queue', () => ({}));
vi.mock('../../lib/webhook', () => ({
  notifyOrderWebhook: vi.fn(),
}));
vi.mock('@/lib/webhook', () => ({
  notifyOrderWebhook: vi.fn(),
}));

vi.mock('../../lib/container', () => ({
  orderService: {
    getById: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
    getAll: vi.fn(),
    delete: vi.fn(),
  },
  paymentGateway: {},
  queueService: {},
}));
vi.mock('@/lib/container', () => ({
  orderService: {
    getById: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
    getAll: vi.fn(),
    delete: vi.fn(),
  },
  paymentGateway: {},
  queueService: {},
}));

import type { PaymentGateway, PaymentResult } from '../../core/application/interfaces/payment-gateway';
import type { QueueService } from '../../core/application/interfaces/queue-service';
import type { OrderService } from '../../core/application/interfaces/order-service';

// Use cases
import { CheckPaymentStatusUseCase } from '../../core/application/usecases/order/check-payment-status';
import { LinkOrderUseCase } from '../../core/application/usecases/order/link-order';

describe('Clean Architecture Integration Tests', () => {
  // Suppress error logs to keep test output clean
  beforeAll(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as any).mockRestore?.();
  });
  let paymentGateway: Mocked<PaymentGateway>;
  let queueService: Mocked<QueueService>;
  let orderService: Mocked<OrderService>;

  let checkPaymentStatusUseCase: CheckPaymentStatusUseCase;
  let linkOrderUseCase: LinkOrderUseCase;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create plain object mocks instead of constructing mocked classes
    paymentGateway = {
      checkPaymentStatus: vi.fn().mockResolvedValue({
        success: true,
        status: 'success',
        data: { returnCode: 1 }
      }),
      processPaymentUpdate: vi.fn().mockResolvedValue(undefined),
    } as unknown as Mocked<PaymentGateway>;

    queueService = {
      addJob: vi.fn().mockResolvedValue('job_123'),
    } as unknown as Mocked<QueueService>;

    orderService = {
      getById: vi.fn().mockResolvedValue(createMockOrder()),
      update: vi.fn().mockResolvedValue(createMockOrder({ checkoutSdkOrderId: 'checkout_456' })),
      create: vi.fn(),
      getAll: vi.fn(),
      delete: vi.fn(),
    } as unknown as Mocked<OrderService>;

    // Initialize use cases with mocked dependencies
    checkPaymentStatusUseCase = new CheckPaymentStatusUseCase(paymentGateway, queueService);
    linkOrderUseCase = new LinkOrderUseCase(orderService, queueService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('CheckPaymentStatusUseCase', () => {
    it('should process successful payment immediately', async () => {
      // Arrange
      const request = {
        orderId: 123,
        checkoutSdkOrderId: 'checkout_456',
        miniAppId: 'app_789'
      };

      const paymentResult: PaymentResult = {
        success: true,
        status: 'success',
        data: { returnCode: 1 }
      };

      paymentGateway.checkPaymentStatus.mockResolvedValue(paymentResult);
      paymentGateway.processPaymentUpdate.mockResolvedValue(undefined);

      // Act
      const result = await checkPaymentStatusUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Payment processed successfully');
      expect(paymentGateway.checkPaymentStatus).toHaveBeenCalledWith('checkout_456', 'app_789');
      expect(paymentGateway.processPaymentUpdate).toHaveBeenCalledWith(123, 'checkout_456', 'app_789');
    });

    it('should schedule delayed check for pending payment', async () => {
      // Arrange
      const request = {
        orderId: 123,
        checkoutSdkOrderId: 'checkout_456',
        miniAppId: 'app_789'
      };

      // Override mock to return pending status
      paymentGateway.checkPaymentStatus.mockResolvedValueOnce({
        success: false,
        status: 'pending',
        data: { returnCode: 0 }
      });

      // Act
      const result = await checkPaymentStatusUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Payment check scheduled');
      expect(queueService.addJob).toHaveBeenCalledWith(
        'orders',
        'checkPaymentStatus',
        {
          type: 'checkPaymentStatus',
          data: {
            orderId: 123,
            checkoutSdkOrderId: 'checkout_456',
            miniAppId: 'app_789'
          }
        },
        { delay: 20 * 60 * 1000 }
      );
    });

    it('should handle payment gateway errors', async () => {
      // Arrange
      const request = {
        orderId: 123,
        checkoutSdkOrderId: 'checkout_456'
      };

      // Simulate gateway throwing error; use case should catch and resolve with failure
      paymentGateway.checkPaymentStatus.mockRejectedValueOnce(new Error('API timeout'));

      // Act
      const result = await checkPaymentStatusUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message.toLowerCase()).toContain('timeout');
    });
  });

  describe('LinkOrderUseCase', () => {
    it('should successfully link order and schedule payment check', async () => {
      // Arrange
      const request = {
        orderId: 123,
        checkoutSdkOrderId: 'checkout_456',
        miniAppId: 'app_789'
      };

      const mockOrder = createMockOrder({
        id: 123,
        paymentStatus: 'pending',
        checkoutSdkOrderId: null
      });

      const updatedOrder = createMockOrder({
        id: 123,
        paymentStatus: 'pending',
        checkoutSdkOrderId: 'checkout_456'
      });

      orderService.getById.mockResolvedValue(mockOrder);
      orderService.update.mockResolvedValue(updatedOrder);
      queueService.addJob.mockResolvedValue('job_123');

      // Act
      const result = await linkOrderUseCase.execute(request);

      // Assert
      expect(result.message).toBe('Đã liên kết đơn hàng thành công!');
      expect(result.orderId).toBe(123);
      expect(result.checkoutSdkOrderId).toBe('checkout_456');

      expect(orderService.getById).toHaveBeenCalledWith(123);
      expect(orderService.update).toHaveBeenCalledWith(123, {
        checkoutSdkOrderId: 'checkout_456',
        updatedAt: expect.any(Date)
      });
      expect(queueService.addJob).toHaveBeenCalledWith(
        'orders',
        'checkPaymentStatus',
        {
          type: 'checkPaymentStatus',
          data: {
            orderId: 123,
            checkoutSdkOrderId: 'checkout_456',
            miniAppId: 'app_789'
          }
        },
        { delay: 20 * 60 * 1000 }
      );
    });

    it('should reject if order not found', async () => {
      // Arrange
      const request = {
        orderId: 999,
        checkoutSdkOrderId: 'checkout_456'
      };

      // Override mock to return null
      orderService.getById.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(linkOrderUseCase.execute(request)).rejects.toThrow('Không tìm thấy đơn hàng');
    });

    it('should reject if order already paid', async () => {
      // Arrange
      const request = {
        orderId: 123,
        checkoutSdkOrderId: 'checkout_456'
      };

      // Override mock to return paid order
      const paidOrder = createMockOrder({
        id: 123,
        paymentStatus: 'success',
        checkoutSdkOrderId: 'old_checkout'
      });
      orderService.getById.mockResolvedValueOnce(paidOrder);

      // Act & Assert
      await expect(linkOrderUseCase.execute(request)).rejects.toThrow('Đơn hàng đã được thanh toán');
    });

    it('should validate input parameters', async () => {
      // Invalid orderId
      await expect(linkOrderUseCase.execute({
        orderId: 'invalid' as any,
        checkoutSdkOrderId: 'checkout_456'
      })).rejects.toThrow('orderId phải là số hợp lệ');

      // Empty checkoutSdkOrderId
      await expect(linkOrderUseCase.execute({
        orderId: 123,
        checkoutSdkOrderId: ''
      })).rejects.toThrow('checkoutSdkOrderId phải là chuỗi hợp lệ');
    });
  });

  describe('Infrastructure Implementations', () => {
    it('should expose ZaloPayGateway constructor', async () => {
      const { ZaloPayGateway } = await import('../../infrastructure/gateways/zalopay-gateway');
      expect(typeof ZaloPayGateway).toBe('function');
    });

    it('should expose BullMQAdapter constructor', async () => {
      const { BullMQAdapter } = await import('../../infrastructure/queue/bullmq-adapter');
      expect(typeof BullMQAdapter).toBe('function');
    });
  });

  describe('Dependency Injection', () => {
    it('should inject dependencies correctly', () => {
      // Verify that use cases receive their dependencies
      expect(checkPaymentStatusUseCase).toBeInstanceOf(CheckPaymentStatusUseCase);
      expect(linkOrderUseCase).toBeInstanceOf(LinkOrderUseCase);
    });
  });
});
