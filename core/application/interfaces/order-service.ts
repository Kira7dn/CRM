import type { Order, OrderItem, Delivery, OrderStatus, PaymentStatus } from "@/core/domain/order";

export interface GetOrdersParams {
  status?: OrderStatus;
  zaloUserId?: string;
}

export interface CreateOrderPayload {
  id?: number;
  zaloUserId?: string;
  checkoutSdkOrderId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  createdAt?: Date;
  updatedAt?: Date;
  items: OrderItem[];
  delivery: Delivery;
  total?: number;
  note?: string;
}

export interface UpdateOrderPayload extends Partial<CreateOrderPayload> {
  id?: never;
}

export interface OrderService {
  getAll(params?: GetOrdersParams): Promise<Order[]>;
  getById(id: number): Promise<Order | null>;
  create(payload: CreateOrderPayload): Promise<Order>;
  update(id: number, payload: UpdateOrderPayload): Promise<Order | null>;
  delete(id: number): Promise<boolean>;
}
