export type OrderStatus = "pending" | "shipping" | "completed";
export type PaymentStatus = "pending" | "success" | "failed";

export interface Delivery {
  name: string;
  phone: string;
  address: string;
  location?: {
    lat: number;
    lon: number; // Match MongoDB field name
  };
}

export interface OrderItem {
  product: Record<string, unknown>;
  quantity: number;
}

export class Order {
  constructor(
    public readonly id: number,
    public zaloUserId: string,
    public checkoutSdkOrderId: string | undefined,
    public status: OrderStatus,
    public paymentStatus: PaymentStatus,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public items: OrderItem[],
    public delivery: Delivery,
    public total: number,
    public note: string | undefined
  ) {}
}
