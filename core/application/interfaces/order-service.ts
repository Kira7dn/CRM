import type { Order, OrderItem, Delivery, OrderStatus, PaymentStatus } from "@/core/domain/order";

export interface GetOrdersParams {
  status?: OrderStatus;
  zaloUserId?: string;
}

export interface OrderPayload extends Partial<Order> {}

export interface OrderService {
  getAll(params?: GetOrdersParams): Promise<Order[]>;
  getById(id: number): Promise<Order | null>;
  create(payload: OrderPayload): Promise<Order>;
  update(payload: OrderPayload): Promise<Order | null>;
  delete(id: number): Promise<boolean>;
}
