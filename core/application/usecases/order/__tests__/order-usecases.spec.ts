import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateOrderUseCase } from '../create-order';
import { UpdateOrderUseCase } from '../update-order';
import { GetOrderByIdUseCase } from '../get-order-by-id';
import { GetOrdersUseCase } from '../get-orders';
import { DeleteOrderUseCase } from '../delete-order';
import type { OrderService } from '@/core/application/interfaces/order-service';
import type { Order, Delivery, OrderItem } from '@/core/domain/order';

describe('Order Use Cases', () => {
  let mockOrderService: OrderService;

  const mockDelivery: Delivery = {
    alias: 'Home',
    address: '123 Main St',
    name: 'John Doe',
    phone: '0123456789',
    stationId: 1,
    image: 'https://example.com/map.jpg',
    location: { lat: 20.9847, lng: 107.7697 },
  };

  const mockOrderItems: OrderItem[] = [
    {
      product: { id: 1, name: 'Fresh Crab', price: 200000 },
      quantity: 2,
    },
    {
      product: { id: 2, name: 'Shrimp', price: 150000 },
      quantity: 1,
    },
  ];

  beforeEach(() => {
    mockOrderService = {
      create: vi.fn(),
      update: vi.fn(),
      getById: vi.fn(),
      getAll: vi.fn(),
      delete: vi.fn(),
    };
  });

  describe('CreateOrderUseCase', () => {
    it('should create a complete order with all fields', async () => {
      const mockOrder: Order = {
        id: 1,
        zaloUserId: 'zalo_user_123',
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date(),
        items: mockOrderItems,
        delivery: mockDelivery,
        total: 550000,
        note: 'Please deliver before 6pm',
      };

      vi.mocked(mockOrderService.create).mockResolvedValue(mockOrder);

      const useCase = new CreateOrderUseCase(mockOrderService);
      const result = await useCase.execute({
        zaloUserId: 'zalo_user_123',
        items: mockOrderItems,
        delivery: mockDelivery,
        total: 550000,
        note: 'Please deliver before 6pm',
      });

      expect(mockOrderService.create).toHaveBeenCalled();
      expect(result.order).toEqual(mockOrder);
      expect(result.order.status).toBe('pending');
      expect(result.order.paymentStatus).toBe('pending');
      expect(result.order.total).toBe(550000);
    });

    it('should create an order with multiple items', async () => {
      const mockOrder: Order = {
        id: 2,
        zaloUserId: 'zalo_user_456',
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date(),
        items: mockOrderItems,
        delivery: mockDelivery,
        total: 550000,
        note: '',
      };

      vi.mocked(mockOrderService.create).mockResolvedValue(mockOrder);

      const useCase = new CreateOrderUseCase(mockOrderService);
      const result = await useCase.execute({
        zaloUserId: 'zalo_user_456',
        items: mockOrderItems,
        delivery: mockDelivery,
        total: 550000,
        note: '',
      });

      expect(result.order.items).toHaveLength(2);
      expect(result.order.items[0].quantity).toBe(2);
      expect(result.order.items[1].quantity).toBe(1);
    });
  });

  describe('UpdateOrderUseCase', () => {
    it('should update order status to shipping', async () => {
      const mockOrder: Order = {
        id: 1,
        zaloUserId: 'zalo_user_123',
        status: 'shipping',
        paymentStatus: 'success',
        createdAt: new Date(),
        updatedAt: new Date(),
        items: mockOrderItems,
        delivery: mockDelivery,
        total: 550000,
        note: '',
      };

      vi.mocked(mockOrderService.update).mockResolvedValue(mockOrder);

      const useCase = new UpdateOrderUseCase(mockOrderService);
      const result = await useCase.execute({
        id: 1,
        payload: {
          status: 'shipping',
          paymentStatus: 'success',
        },
      });

      expect(mockOrderService.update).toHaveBeenCalledWith(1, {
        status: 'shipping',
        paymentStatus: 'success',
      });
      expect(result.order?.status).toBe('shipping');
      expect(result.order?.paymentStatus).toBe('success');
    });

    it('should update order status to completed', async () => {
      const mockOrder: Order = {
        id: 1,
        zaloUserId: 'zalo_user_123',
        status: 'completed',
        paymentStatus: 'success',
        createdAt: new Date(),
        updatedAt: new Date(),
        items: mockOrderItems,
        delivery: mockDelivery,
        total: 550000,
        note: '',
      };

      vi.mocked(mockOrderService.update).mockResolvedValue(mockOrder);

      const useCase = new UpdateOrderUseCase(mockOrderService);
      const result = await useCase.execute({
        id: 1,
        payload: {
          status: 'completed',
        },
      });

      expect(result.order?.status).toBe('completed');
    });

    it('should return null when order not found', async () => {
      vi.mocked(mockOrderService.update).mockResolvedValue(null);

      const useCase = new UpdateOrderUseCase(mockOrderService);
      const result = await useCase.execute({
        id: 999,
        payload: {
          status: 'shipping',
        },
      });

      expect(result.order).toBeNull();
    });
  });

  describe('GetOrderByIdUseCase', () => {
    it('should return an order by id', async () => {
      const mockOrder: Order = {
        id: 1,
        zaloUserId: 'zalo_user_123',
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date(),
        items: mockOrderItems,
        delivery: mockDelivery,
        total: 550000,
        note: '',
      };

      vi.mocked(mockOrderService.getById).mockResolvedValue(mockOrder);

      const useCase = new GetOrderByIdUseCase(mockOrderService);
      const result = await useCase.execute({ id: 1 });

      expect(mockOrderService.getById).toHaveBeenCalledWith(1);
      expect(result.order).toEqual(mockOrder);
      expect(result.order.items).toHaveLength(2);
    });

    it('should return null when order not found', async () => {
      vi.mocked(mockOrderService.getById).mockResolvedValue(null);

      const useCase = new GetOrderByIdUseCase(mockOrderService);
      const result = await useCase.execute({ id: 999 });

      expect(result.order).toBeNull();
    });
  });

  describe('GetOrdersUseCase', () => {
    it('should return all orders for a user', async () => {
      const mockOrders: Order[] = [
        {
          id: 1,
          zaloUserId: 'zalo_user_123',
          status: 'pending',
          paymentStatus: 'pending',
          createdAt: new Date(),
          items: mockOrderItems,
          delivery: mockDelivery,
          total: 550000,
          note: '',
        },
        {
          id: 2,
          zaloUserId: 'zalo_user_123',
          status: 'completed',
          paymentStatus: 'success',
          createdAt: new Date(),
          items: mockOrderItems,
          delivery: mockDelivery,
          total: 300000,
          note: '',
        },
      ];

      vi.mocked(mockOrderService.getAll).mockResolvedValue(mockOrders);

      const useCase = new GetOrdersUseCase(mockOrderService);
      const result = await useCase.execute({ zaloUserId: 'zalo_user_123' });

      expect(mockOrderService.getAll).toHaveBeenCalledWith({
        zaloUserId: 'zalo_user_123',
      });
      expect(result.orders).toEqual(mockOrders);
      expect(result.orders).toHaveLength(2);
    });

    it('should filter orders by status', async () => {
      const mockOrders: Order[] = [
        {
          id: 1,
          zaloUserId: 'zalo_user_123',
          status: 'pending',
          paymentStatus: 'pending',
          createdAt: new Date(),
          items: mockOrderItems,
          delivery: mockDelivery,
          total: 550000,
          note: '',
        },
      ];

      vi.mocked(mockOrderService.getAll).mockResolvedValue(mockOrders);

      const useCase = new GetOrdersUseCase(mockOrderService);
      const result = await useCase.execute({
        zaloUserId: 'zalo_user_123',
        status: 'pending',
      });

      expect(mockOrderService.getAll).toHaveBeenCalledWith({
        zaloUserId: 'zalo_user_123',
        status: 'pending',
      });
      expect(result.orders).toHaveLength(1);
      expect(result.orders[0].status).toBe('pending');
    });

    it('should return empty array when no orders exist', async () => {
      vi.mocked(mockOrderService.getAll).mockResolvedValue([]);

      const useCase = new GetOrdersUseCase(mockOrderService);
      const result = await useCase.execute({ zaloUserId: 'zalo_user_999' });

      expect(result.orders).toEqual([]);
      expect(result.orders).toHaveLength(0);
    });
  });

  describe('DeleteOrderUseCase', () => {
    it('should delete an order and return true', async () => {
      vi.mocked(mockOrderService.delete).mockResolvedValue(true);

      const useCase = new DeleteOrderUseCase(mockOrderService);
      const result = await useCase.execute({ id: 1 });

      expect(mockOrderService.delete).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
    });

    it('should return false when order not found', async () => {
      vi.mocked(mockOrderService.delete).mockResolvedValue(false);

      const useCase = new DeleteOrderUseCase(mockOrderService);
      const result = await useCase.execute({ id: 999 });

      expect(result.success).toBe(false);
    });
  });
});
