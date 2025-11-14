import type { OrderService } from "@/core/application/interfaces/order-service";

export interface CheckOrderStatusRequest {
  orderId: number;
}

export interface CheckOrderStatusResponse {
  orderId: number;
  status: string;
  paymentStatus: string;
}

export class CheckOrderStatusUseCase {
  constructor(private orderService: OrderService) {}

  async execute(request: CheckOrderStatusRequest): Promise<CheckOrderStatusResponse> {
    const order = await this.orderService.getById(request.orderId);
    if (!order) throw new Error("Không tìm thấy đơn hàng");
    return {
      orderId: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
    };
  }
}
