import type { OrderService, CreateOrderPayload } from "@/core/application/interfaces/order-service";
import type { Order } from "@/core/domain/order";

export interface CreateOrderRequest {
  zaloUserId: string;
  items: Order['items'];
  total: number;
  delivery: {
    address: string;
    name: string;
    phone: string;
  };
  note?: string;
  checkoutSdkOrderId?: string;
}

export interface CreateOrderResponse {
  order: Order;
}

export class CreateOrderUseCase {
  constructor(private orderService: OrderService) {}

  async execute(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    console.log('[CreateOrderUseCase] Starting order creation with data:', request);

    // Validate required fields
    if (!request.zaloUserId || !request.items || request.items.length === 0) {
      console.error('[CreateOrderUseCase] Validation failed: missing required fields');
      throw new Error('Missing required fields: zaloUserId and items');
    }

    console.log('[CreateOrderUseCase] Creating order with validated data');

    // Create order object
    const order: Order = {
      id: 0, // Will be set by repository
      zaloUserId: request.zaloUserId,
      status: 'pending',
      paymentStatus: 'pending',
      items: request.items,
      total: request.total,
      createdAt: new Date(),
      updatedAt: new Date(),
      checkoutSdkOrderId: request.checkoutSdkOrderId,
      delivery: {
        alias: '', // Default value
        address: request.delivery.address,
        name: request.delivery.name,
        phone: request.delivery.phone,
        stationId: 0, // Default value
        image: '', // Default value
        location: { lat: 0, lng: 0 }, // Default value
      },
      note: request.note || '',
    };

    console.log('[CreateOrderUseCase] Created order object:', order);

    try {
      // Map Order to CreateOrderPayload for the service (don't set id, let repository generate it)
      const createPayload: CreateOrderPayload = {
        zaloUserId: order.zaloUserId,
        checkoutSdkOrderId: order.checkoutSdkOrderId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items,
        delivery: order.delivery,
        total: order.total,
        note: order.note,
      };

      // Save to database
      const createdOrder = await this.orderService.create(createPayload);
      console.log('[CreateOrderUseCase] Order saved to database:', createdOrder);

      return { order: createdOrder };
    } catch (error: any) {
      console.error('[CreateOrderUseCase] Failed to create order:', {
        error: error.message,
        stack: error.stack,
        request,
        order,
      });
      throw error;
    }
  }
}
