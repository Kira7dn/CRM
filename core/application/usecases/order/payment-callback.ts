import { createHmac } from "crypto";
import type { Order, PaymentMethod } from "@/core/domain/managements/order";
import type { OrderService } from "@/core/application/interfaces/order-service";
import { notifyOrderWebhook } from "@/lib/webhook";

export interface PaymentCallbackRequest {
  data: Record<string, unknown>;
  overallMac: string;
}

export interface PaymentCallbackResponse {
  returnCode: number;
  returnMessage: string;
  order?: Order;
}

export class PaymentCallbackUseCase {
  constructor(private orderService: OrderService) { }

  async execute(request: PaymentCallbackRequest): Promise<PaymentCallbackResponse> {
    try {
      const { data, overallMac } = request;
      if (!data || typeof overallMac !== "string") {
        return { returnCode: 0, returnMessage: "Thiếu dữ liệu callback" };
      }

      // Validate MAC
      const dataOverallMac = Object.keys(data)
        .sort()
        .map((key) => `${key}=${data[key]}`)
        .join("&");

      const secretKey = process.env.CHECKOUT_SDK_PRIVATE_KEY;
      if (!secretKey) {
        return { returnCode: 0, returnMessage: "Server thiếu CHECKOUT_SDK_PRIVATE_KEY" };
      }

      const validOverallMac = createHmac("sha256", secretKey).update(dataOverallMac).digest("hex");
      if (overallMac !== validOverallMac) {
        return { returnCode: 0, returnMessage: "MAC không hợp lệ" };
      }

      // Parse orderId from extradata
      const resultCode = Number(data["resultCode"]);
      const extradata = data["extradata"];
      let orderId: number | undefined;

      if (typeof extradata === "string") {
        try {
          const parsed = JSON.parse(decodeURIComponent(extradata));
          if (parsed && typeof parsed.orderId === "number") {
            orderId = parsed.orderId;
          }
        } catch {
          console.log("[paymentCallback] Failed to parse extradata", { extradata });
        }
      }

      if (!orderId) {
        return { returnCode: 0, returnMessage: "Không tìm thấy orderId trong extradata" };
      }

      // Update payment status
      const paymentStatus = resultCode === 1 ? "success" : "failed";

      // Get payment method from data or use a default value
      const paymentMethod = (typeof data['method'] === 'string'
        ? data['method']
        : 'bank_transfer') as PaymentMethod;

      // Get amount from data or use 0 as fallback
      const amount = typeof data['amount'] === 'number'
        ? data['amount']
        : typeof data['amount'] === 'string'
          ? parseFloat(data['amount']) || 0
          : 0;
      console.log("[paymentCallback] Updated order", { orderId, paymentStatus, paymentMethod, amount });

      const updatedOrder = await this.orderService.update({
        id: orderId,
        payment: {
          method: paymentMethod,
          status: paymentStatus,
          amount: amount,
          paidAt: paymentStatus === "success" ? new Date() : undefined,
        },
        updatedAt: new Date()
      });
      console.log("[paymentCallback] Updated order", { updatedOrder });
      if (!updatedOrder) {
        return { returnCode: 0, returnMessage: "Order not found" };
      }

      // Send webhook notification for successful payments
      if (updatedOrder.payment.status === "success") {
        void notifyOrderWebhook(updatedOrder);
      }

      return {
        returnCode: 1,
        returnMessage: "Đã cập nhật trạng thái đơn hàng thành công!",
        order: updatedOrder
      };
    } catch (error) {
      return {
        returnCode: 0,
        returnMessage: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
