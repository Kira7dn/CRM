import type { OrderService } from "@/core/application/interfaces/order-service";

export interface PaymentCallbackRequest {
  data: Record<string, unknown>;
  overallMac: string;
}

export interface PaymentCallbackResponse {
  returnCode: number;
  returnMessage: string;
}

export class PaymentCallbackUseCase {
  constructor(private orderService: OrderService) {}

  async execute(request: PaymentCallbackRequest): Promise<PaymentCallbackResponse> {
    // Validate MAC logic
    const { data, overallMac } = request;
    const dataOverallMac = Object.keys(data)
      .sort()
      .map((key) => `${key}=${data[key]}`)
      .join("&");
    // Validate MAC
    const valid = overallMac === "placeholder"; // Implement

    if (!valid) return { returnCode: 0, returnMessage: "Invalid MAC" };

    const resultCode = Number(data["resultCode"]);
    const extradata = data["extradata"];
    let orderId: number | undefined;
    if (typeof extradata === "string") {
      try {
        const parsed = JSON.parse(decodeURIComponent(extradata));
        orderId = parsed.orderId;
      } catch {}
    }
    if (!orderId) return { returnCode: 0, returnMessage: "OrderId not found" };

    const paymentStatus = resultCode === 1 ? "success" : "failed";
    const updated = await this.orderService.update(orderId, { paymentStatus: paymentStatus as any });
    if (!updated) return { returnCode: 0, returnMessage: "Order not found" };

    // Notify webhook logic
    return { returnCode: 1, returnMessage: "Updated successfully" };
  }
}
