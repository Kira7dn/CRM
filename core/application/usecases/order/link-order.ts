import type { Order } from "@/core/domain/managements/order";
import type { OrderService } from "@/core/application/interfaces/order-service";
import type { QueueService } from "@/core/application/interfaces/queue-service";

export interface LinkOrderRequest {
  orderId: number;
  platformOrderId: string; // e.g., Zalo Checkout SDK Order ID
  platformSource?: string; // e.g., "zalo", "facebook", "tiktok", "website"
  miniAppId?: string;
}

export interface LinkOrderResponse {
  message: string;
  orderId: number;
  platformOrderId: string;
}

export class LinkOrderUseCase {
  constructor(
    private orderService: OrderService,
    private queueService: QueueService
  ) { }

  async execute(request: LinkOrderRequest): Promise<LinkOrderResponse> {
    const { orderId, platformOrderId, platformSource, miniAppId } = request;

    if (typeof orderId !== "number" || Number.isNaN(orderId)) {
      throw new Error("orderId phải là số hợp lệ.");
    }

    if (typeof platformOrderId !== "string" || platformOrderId.length === 0) {
      throw new Error("platformOrderId phải là chuỗi hợp lệ.");
    }

    const existing = await this.orderService.getById(orderId);

    if (!existing) {
      throw new Error("Không tìm thấy đơn hàng");
    }
    if (existing.payment.status === "success") {
      throw new Error("Đơn hàng đã được thanh toán");
    }

    const updated = await this.orderService.update({
      id: orderId,
      platformOrderId,
      platformSource: platformSource || "zalo",
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
          platformOrderId,
          platformSource: platformSource || "zalo",
          miniAppId: miniAppId ?? process.env.APP_ID
        }
      },
      { delay: 20 * 60 * 1000 } // 20 minutes
    );

    return {
      message: "Đã liên kết đơn hàng thành công!",
      orderId: updated.id,
      platformOrderId
    };
  }
}
