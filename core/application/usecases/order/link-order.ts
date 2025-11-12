import type { Order } from "@/core/domain/order";
import type { OrderService } from "@/core/application/interfaces/order-service";
import type { QueueService } from "@/core/application/interfaces/queue-service";

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
  constructor(
    private orderService: OrderService,
    private queueService: QueueService
  ) {}

  async execute(request: LinkOrderRequest): Promise<LinkOrderResponse> {
    const { orderId, checkoutSdkOrderId, miniAppId } = request;

    if (typeof orderId !== "number" || Number.isNaN(orderId)) {
      throw new Error("orderId phải là số hợp lệ.");
    }

    if (typeof checkoutSdkOrderId !== "string" || checkoutSdkOrderId.length === 0) {
      throw new Error("checkoutSdkOrderId phải là chuỗi hợp lệ.");
    }

    const existing = await this.orderService.getById(orderId);

    if (!existing) {
      throw new Error("Không tìm thấy đơn hàng");
    }
    if (existing.paymentStatus === "success") {
      throw new Error("Đơn hàng đã được thanh toán");
    }

    const updated = await this.orderService.update(orderId, {
      checkoutSdkOrderId,
      updatedAt: new Date()
    });

    if (!updated) {
      throw new Error("Không thể cập nhật đơn hàng");
    }

    // Enqueue delayed job to check payment status after 20 minutes
    await this.queueService.addJob(
      "orders",
      "checkPaymentStatus",
      {
        type: "checkPaymentStatus",
        data: {
          orderId,
          checkoutSdkOrderId,
          miniAppId: miniAppId ?? process.env.APP_ID
        }
      },
      { delay: 20 * 60 * 1000 } // 20 minutes
    );

    return {
      message: "Đã liên kết đơn hàng thành công!",
      orderId: updated.id,
      checkoutSdkOrderId
    };
  }
}
