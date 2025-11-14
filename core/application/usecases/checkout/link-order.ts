import type { OrderService } from "@/core/application/interfaces/order-service";

export interface LinkOrderRequest {
  orderId: number;
  checkoutSdkOrderId: string;
  miniAppId?: string;
}

export interface LinkOrderResponse {
  message: string;
  orderId: number;
  checkoutSdkOrderId: string;
}

export class LinkOrderUseCase {
  constructor(private orderService: OrderService) {}

  async execute(request: LinkOrderRequest): Promise<LinkOrderResponse> {
    const order = await this.orderService.getById(request.orderId);
    if (!order) throw new Error("Order not found");
    if (order.paymentStatus === "success") throw new Error("Order already paid");

    const updated = await this.orderService.update({ id: request.orderId, checkoutSdkOrderId: request.checkoutSdkOrderId });
    if (!updated) throw new Error("Update failed");

    // Enqueue job logic here or in infrastructure
    return { message: "Linked successfully", orderId: updated.id, checkoutSdkOrderId: request.checkoutSdkOrderId };
  }
}
