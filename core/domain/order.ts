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

export interface Order {
  id: number;
  zaloUserId: string;
  checkoutSdkOrderId?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt?: Date;
  items: OrderItem[];
  delivery: Delivery;
  total: number;
  note?: string; // Make optional to match DB schema
}
