import type { OrderService, OrderPayload } from "@/core/application/interfaces/sales/order-service";
import type { Order, OrderItem, Delivery, PaymentMethod } from "@/core/domain/sales/order";
import { validateOrder, calculateOrderTotal } from "@/core/domain/sales/order";

// export interface CreateOrderRequest {
//   customerId: string;
//   items: OrderItem[];
//   delivery: Delivery;
//   payment?: {
//     method: PaymentMethod;
//     amount?: number;
//   };
//   platformOrderId?: string;
//   platformSource?: string;
//   shippingFee?: number;
//   discount?: number;
//   note?: string;
//   tags?: string[];
// }

export interface CreateOrderRequest extends OrderPayload { }

export interface CreateOrderResponse {
  order: Order;
}

export class CreateOrderUseCase {
  constructor(private orderService: OrderService) { }

  async execute(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    console.log('[CreateOrderUseCase] Starting order creation with data:', request);

    // Validate required fields
    if (!request.customerId || !request.items || request.items.length === 0) {
      console.error('[CreateOrderUseCase] Validation failed: missing required fields');
      throw new Error('Missing required fields: customerId and items');
    }

    if (!request.delivery || !request.delivery.name || !request.delivery.phone || !request.delivery.address) {
      throw new Error('Missing required delivery information');
    }

    console.log('[CreateOrderUseCase] Creating order with validated data');

    // Calculate pricing
    const subtotal = request.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const shippingFee = request.shippingFee || 0;
    const discount = request.discount || 0;
    const total = calculateOrderTotal(request.items, shippingFee, discount);

    // Create order payload
    const orderPayload: OrderPayload = {
      customerId: request.customerId,
      status: 'pending',
      items: request.items,
      delivery: request.delivery,
      subtotal,
      shippingFee,
      discount,
      total,
      payment: {
        method: request.payment?.method || 'cod',
        status: 'pending',
        amount: request.payment?.amount || total,
      },
      tags: request.tags || [],
      platformOrderId: request.platformOrderId,
      platformSource: request.platformSource,
      note: request.note,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validate order data
    const validationErrors = validateOrder(orderPayload as Partial<Order>);
    if (validationErrors.length > 0) {
      throw new Error(`Order validation failed: ${validationErrors.join(', ')}`);
    }

    console.log('[CreateOrderUseCase] Created order payload:', orderPayload);

    try {
      // Save to database
      const createdOrder = await this.orderService.create(orderPayload);
      console.log('[CreateOrderUseCase] Order saved to database:', createdOrder);

      return { order: createdOrder };
    } catch (error: any) {
      console.error('[CreateOrderUseCase] Failed to create order:', {
        error: error.message,
        stack: error.stack,
        request,
      });
      throw error;
    }
  }
}
