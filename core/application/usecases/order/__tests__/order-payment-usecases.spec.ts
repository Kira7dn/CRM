import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LinkOrderUseCase } from '../link-order';
import { CheckPaymentStatusUseCase } from '../check-payment-status';
import type { OrderService } from '@/core/application/interfaces/order-service';
import type { QueueService } from '@/core/application/interfaces/queue-service';
import type { PaymentGateway } from '@/core/application/interfaces/payment-gateway';
import type { Order } from '@/core/domain/order';

describe('Order Payment Use Cases', () => {
  let mockOrderService: OrderService;
  let mockQueueService: QueueService;
  let mockPaymentGateway: PaymentGateway;

  const mockOrder: Order = {
    id: 1,
    zaloUserId: 'zalo_user_123',
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: new Date(),
    items: [
      { product: { id: 1, name: 'Crab', price: 200000 }, quantity: 2 },
    ],
    delivery: {
      alias: 'Home',
      address: '123 Main St',
      name: 'John Doe',
      phone: '0123456789',
      stationId: 1,
      image: '',
      location: { lat: 0, lng: 0 },
    },
    total: 400000,
    note: '',
  };

  beforeEach(() => {
    mockOrderService = {
      create: vi.fn(),
      update: vi.fn(),
      getById: vi.fn(),
      getAll: vi.fn(),
      delete: vi.fn(),
    };

    mockQueueService = {
      addJob: vi.fn().mockResolvedValue(undefined),
    };

    mockPaymentGateway = {
      checkPaymentStatus: vi.fn(),
      processPaymentUpdate: vi.fn(),
    };
  });

  describe('LinkOrderUseCase', () => {
    it('should link order with checkout SDK order ID', async () => {
      const existingOrder = { ...mockOrder };
      const updatedOrder = {
        ...mockOrder,
        checkoutSdkOrderId: 'checkout_123',
        updatedAt: new Date(),
      };

      vi.mocked(mockOrderService.getById).mockResolvedValue(existingOrder);
      vi.mocked(mockOrderService.update).mockResolvedValue(updatedOrder);

      const useCase = new LinkOrderUseCase(mockOrderService, mockQueueService);
      const result = await useCase.execute({
        orderId: 1,
        checkoutSdkOrderId: 'checkout_123',
        miniAppId: 'app_123',
      });

      expect(mockOrderService.getById).toHaveBeenCalledWith(1);
      expect(mockOrderService.update).toHaveBeenCalledWith(1, {
        checkoutSdkOrderId: 'checkout_123',
        updatedAt: expect.any(Date),
      });
      expect(mockQueueService.addJob).toHaveBeenCalledWith(
        'orders',
        'checkPaymentStatus',
        {
          type: 'checkPaymentStatus',
          data: {
            orderId: 1,
            checkoutSdkOrderId: 'checkout_123',
            miniAppId: 'app_123',
          },
        },
        { delay: 20 * 60 * 1000 }
      );
      expect(result.message).toBe('Đã liên kết đơn hàng thành công!');
      expect(result.orderId).toBe(1);
      expect(result.checkoutSdkOrderId).toBe('checkout_123');
    });

    it('should throw error when orderId is invalid', async () => {
      const useCase = new LinkOrderUseCase(mockOrderService, mockQueueService);

      await expect(
        useCase.execute({
          orderId: NaN,
          checkoutSdkOrderId: 'checkout_123',
        })
      ).rejects.toThrow('orderId phải là số hợp lệ.');
    });

    it('should throw error when checkoutSdkOrderId is empty', async () => {
      const useCase = new LinkOrderUseCase(mockOrderService, mockQueueService);

      await expect(
        useCase.execute({
          orderId: 1,
          checkoutSdkOrderId: '',
        })
      ).rejects.toThrow('checkoutSdkOrderId phải là chuỗi hợp lệ.');
    });

    it('should throw error when order not found', async () => {
      vi.mocked(mockOrderService.getById).mockResolvedValue(null);

      const useCase = new LinkOrderUseCase(mockOrderService, mockQueueService);

      await expect(
        useCase.execute({
          orderId: 999,
          checkoutSdkOrderId: 'checkout_123',
        })
      ).rejects.toThrow('Không tìm thấy đơn hàng');
    });

    it('should throw error when order already paid', async () => {
      const paidOrder = { ...mockOrder, paymentStatus: 'success' as const };
      vi.mocked(mockOrderService.getById).mockResolvedValue(paidOrder);

      const useCase = new LinkOrderUseCase(mockOrderService, mockQueueService);

      await expect(
        useCase.execute({
          orderId: 1,
          checkoutSdkOrderId: 'checkout_123',
        })
      ).rejects.toThrow('Đơn hàng đã được thanh toán');
    });

    it('should throw error when update fails', async () => {
      vi.mocked(mockOrderService.getById).mockResolvedValue(mockOrder);
      vi.mocked(mockOrderService.update).mockResolvedValue(null);

      const useCase = new LinkOrderUseCase(mockOrderService, mockQueueService);

      await expect(
        useCase.execute({
          orderId: 1,
          checkoutSdkOrderId: 'checkout_123',
        })
      ).rejects.toThrow('Không thể cập nhật đơn hàng');
    });
  });

  describe('CheckPaymentStatusUseCase', () => {
    it('should process successful payment immediately', async () => {
      vi.mocked(mockPaymentGateway.checkPaymentStatus).mockResolvedValue({
        success: true,
        status: 'success',
      });
      vi.mocked(mockPaymentGateway.processPaymentUpdate).mockResolvedValue(undefined);

      const useCase = new CheckPaymentStatusUseCase(
        mockPaymentGateway,
        mockQueueService
      );
      const result = await useCase.execute({
        orderId: 1,
        checkoutSdkOrderId: 'checkout_123',
        miniAppId: 'app_123',
      });

      expect(mockPaymentGateway.checkPaymentStatus).toHaveBeenCalledWith(
        'checkout_123',
        'app_123'
      );
      expect(mockPaymentGateway.processPaymentUpdate).toHaveBeenCalledWith(
        1,
        'checkout_123',
        'app_123'
      );
      expect(result.success).toBe(true);
      expect(result.message).toBe('Payment processed successfully');
    });

    it('should process failed payment immediately', async () => {
      vi.mocked(mockPaymentGateway.checkPaymentStatus).mockResolvedValue({
        success: false,
        status: 'failed',
      });
      vi.mocked(mockPaymentGateway.processPaymentUpdate).mockResolvedValue(undefined);

      const useCase = new CheckPaymentStatusUseCase(
        mockPaymentGateway,
        mockQueueService
      );
      const result = await useCase.execute({
        orderId: 1,
        checkoutSdkOrderId: 'checkout_123',
      });

      expect(mockPaymentGateway.processPaymentUpdate).toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Payment failed');
    });

    it('should schedule delayed check when payment is pending', async () => {
      vi.mocked(mockPaymentGateway.checkPaymentStatus).mockResolvedValue({
        success: false,
        status: 'pending',
      });

      const useCase = new CheckPaymentStatusUseCase(
        mockPaymentGateway,
        mockQueueService
      );
      const result = await useCase.execute({
        orderId: 1,
        checkoutSdkOrderId: 'checkout_123',
        miniAppId: 'app_123',
      });

      expect(mockQueueService.addJob).toHaveBeenCalledWith(
        'orders',
        'checkPaymentStatus',
        {
          type: 'checkPaymentStatus',
          data: {
            orderId: 1,
            checkoutSdkOrderId: 'checkout_123',
            miniAppId: 'app_123',
          },
        },
        { delay: 20 * 60 * 1000 }
      );
      expect(result.success).toBe(true);
      expect(result.message).toBe('Payment check scheduled');
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(mockPaymentGateway.checkPaymentStatus).mockRejectedValue(
        new Error('Network error')
      );

      const useCase = new CheckPaymentStatusUseCase(
        mockPaymentGateway,
        mockQueueService
      );
      const result = await useCase.execute({
        orderId: 1,
        checkoutSdkOrderId: 'checkout_123',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Network error');
    });

    it('should handle unknown errors', async () => {
      vi.mocked(mockPaymentGateway.checkPaymentStatus).mockRejectedValue(
        'Unknown error'
      );

      const useCase = new CheckPaymentStatusUseCase(
        mockPaymentGateway,
        mockQueueService
      );
      const result = await useCase.execute({
        orderId: 1,
        checkoutSdkOrderId: 'checkout_123',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unknown error');
    });
  });
});
