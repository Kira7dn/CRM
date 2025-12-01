import type { VnpayIpnRequest, VnpayIpnParams, VnpayIpnResult } from "@/infrastructure/adapters/external/payment/vnpay-gateway";
import type { VnpayGateway } from "@/core/application/interfaces/shared/vnpay-gateway";
import type { OrderService } from "@/core/application/interfaces/sales/order-service";
import type { PaymentStatus } from "@/core/domain/sales/order";

export interface HandleVnpayIpnRequest {
  body: VnpayIpnRequest;
}

export interface HandleVnpayIpnResponse {
  result: VnpayIpnResult;
  order?: any; // Using any for now, should be Order type
}

export class HandleVnpayIpnUseCase {
  constructor(
    private readonly vnpayGateway: VnpayGateway,
    private readonly orderService: OrderService
  ) { }

  async execute(request: HandleVnpayIpnRequest): Promise<HandleVnpayIpnResponse> {
    console.log('[HandleVnpayIpnUseCase] Processing VNPay IPN:', request);

    const { body } = request;
    const { ipnReceivedData } = body ?? {};

    // Normalize received data to Record<string, string>
    const params = this.normalizeRecord(ipnReceivedData);
    if (!params) {
      return {
        result: {
          returnCode: -1,
          returnMessage: "Invalid payload",
          isSuccess: false,
        },
      };
    }

    // Validate signature
    const isValidSignature = await this.vnpayGateway.validateSignature(params);
    if (!isValidSignature) {
      return {
        result: {
          returnCode: -1,
          returnMessage: "Invalid signature",
          isSuccess: false,
        },
      };
    }

    // Parse payment result
    const result = this.vnpayGateway.parsePaymentResult(params);

    // If order ID not found, return early
    if (!result.orderId) {
      return { result };
    }

    // Update order status
    const paymentStatus = result.isSuccess ? "success" : "failed";
    const updatePayload = {
      payment: {
        method: "vnpay" as const,
        status: paymentStatus as PaymentStatus,
        amount: Number(params.vnp_Amount) / 100, // Convert from VNĐ to VND (divide by 100)
        paidAt: paymentStatus === "success" ? new Date() : undefined,
      },
      platformOrderId: params.vnp_TxnRef?.trim(),
      platformSource: "zalo",
      updatedAt: new Date(),
    };

    try {
      const updatedOrder = await this.orderService.update({ id: result.orderId, ...updatePayload });
      return {
        result,
        order: updatedOrder,
      };
    } catch (error) {
      console.error('[HandleVnpayIpnUseCase] Failed to update order:', error);
      return {
        result: {
          ...result,
          returnCode: 0,
          returnMessage: "Order not found",
        },
      };
    }
  }

  private normalizeRecord(value: unknown): VnpayIpnParams | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const result: Record<string, string> = {};
    for (const [key, raw] of Object.entries(value)) {
      if (raw === undefined || raw === null) continue;
      result[key] = typeof raw === "string" ? raw : String(raw);
    }
    return result;
  }
}
