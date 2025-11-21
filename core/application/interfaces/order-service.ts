import type { Order, OrderItem, Delivery, OrderStatus, PaymentStatus, PaymentInfo } from "@/core/domain/managements/order";

export interface GetOrdersParams {
  status?: OrderStatus;
  customerId?: string;
  platformSource?: string;
}

export interface OrderPayload extends Partial<Order> { }

export interface OrderService {
  getAll(params?: GetOrdersParams): Promise<Order[]>;
  getById(id: number): Promise<Order | null>;
  create(payload: OrderPayload): Promise<Order>;
  update(payload: OrderPayload & { id: number }): Promise<Order | null>;
  delete(id: number): Promise<boolean>;

  // Platform-specific queries
  getByPlatformOrderId(platformOrderId: string, platformSource: string): Promise<Order | null>;
}
