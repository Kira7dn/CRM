export type OrderStatus = "pending" | "confirmed" | "processing" | "shipping" | "delivered" | "completed" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "success" | "failed" | "refunded";
export type PaymentMethod = "cod" | "bank_transfer" | "zalopay" | "momo" | "vnpay" | "credit_card";
export type ShippingProvider = "ghn" | "ghtk" | "vnpost" | "self_delivery";

export interface Delivery {
  name: string;
  phone: string;
  address: string;
  location?: {
    lat: number;
    lon: number; // Match MongoDB field name
  };
  shippingProvider?: ShippingProvider;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
}

export interface OrderItem {
  productId: string; // Reference to Product ID
  productName: string;
  productImage?: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: Record<string, unknown>; // Full product data (optional, for backward compatibility)
}

/**
 * Payment information
 */
export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: Date;
  amount: number;
}

/**
 * Order domain entity
 * Unified to work with Customer entity through customerId
 */
export class Order {
  constructor(
    public readonly id: number,

    // Customer reference (unified)
    public customerId: string, // Internal customer ID (references Customer.id)

    // Order details (bắt buộc)
    public status: OrderStatus,
    public items: OrderItem[],
    public delivery: Delivery,

    // Pricing (bắt buộc)
    public subtotal: number, // Sum of items total
    public shippingFee: number,
    public discount: number,
    public total: number, // subtotal + shippingFee - discount

    // Payment (bắt buộc)
    public payment: PaymentInfo,

    // Timestamps (bắt buộc)
    public readonly createdAt: Date,
    public updatedAt: Date,

    // Additional info (bắt buộc)
    public tags: string[], // For categorization (e.g., "wholesale", "gift")

    // Platform-specific order references (tùy chọn)
    public platformOrderId?: string, // External platform order ID (e.g., Zalo Checkout SDK Order ID)
    public platformSource?: string, // Source platform (e.g., "zalo", "facebook", "website")

    // Additional info (tùy chọn)
    public note?: string,
    public internalNotes?: string, // Admin-only notes
    public confirmedAt?: Date,
    public completedAt?: Date,
    public cancelledAt?: Date,

    // Staff assignment (tùy chọn)
    public assignedTo?: string, // User ID of assigned staff member

    // Order lifecycle timestamps (tùy chọn)
    public processingAt?: Date, // When order started processing
    public shippingAt?: Date, // When order was shipped
    public deliveredAt?: Date // When order was delivered
  ) {}

  // Calculate processing time in hours
  getProcessingTime(): number | null {
    if (!this.confirmedAt || !this.processingAt) return null;
    return (this.processingAt.getTime() - this.confirmedAt.getTime()) / (1000 * 60 * 60);
  }

  // Calculate delivery time in hours
  getDeliveryTime(): number | null {
    if (!this.shippingAt || !this.deliveredAt) return null;
    return (this.deliveredAt.getTime() - this.shippingAt.getTime()) / (1000 * 60 * 60);
  }

  // Calculate total fulfillment time in hours
  getFulfillmentTime(): number | null {
    if (!this.confirmedAt || !this.deliveredAt) return null;
    return (this.deliveredAt.getTime() - this.confirmedAt.getTime()) / (1000 * 60 * 60);
  }

  // Check if order is late based on estimated delivery
  isLate(): boolean {
    if (!this.delivery.estimatedDelivery) return false;
    const now = new Date();
    return now > this.delivery.estimatedDelivery && this.status !== "delivered" && this.status !== "completed";
  }
}

/**
 * Helper function to calculate order total
 */
export function calculateOrderTotal(
  items: OrderItem[],
  shippingFee: number = 0,
  discount: number = 0
): number {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  return subtotal + shippingFee - discount;
}

/**
 * Validation function for Order entity
 */
export function validateOrder(data: Partial<Order>): string[] {
  const errors: string[] = [];

  if (!data.customerId || data.customerId.trim().length === 0) {
    errors.push("Customer ID is required");
  }

  if (!data.items || data.items.length === 0) {
    errors.push("Order must have at least one item");
  }

  if (data.items) {
    data.items.forEach((item, index) => {
      if (!item.productId) {
        errors.push(`Product ID is required for item at index ${index}`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Valid quantity is required for item at index ${index}`);
      }
      if (!item.unitPrice || item.unitPrice < 0) {
        errors.push(`Valid unit price is required for item at index ${index}`);
      }
    });
  }

  if (!data.delivery) {
    errors.push("Delivery information is required");
  } else {
    if (!data.delivery.name || data.delivery.name.trim().length === 0) {
      errors.push("Delivery recipient name is required");
    }
    if (!data.delivery.phone || data.delivery.phone.trim().length === 0) {
      errors.push("Delivery phone is required");
    }
    if (!data.delivery.address || data.delivery.address.trim().length === 0) {
      errors.push("Delivery address is required");
    }
  }

  if (data.total !== undefined && data.total < 0) {
    errors.push("Order total cannot be negative");
  }

  return errors;
}
