import type { OrderService } from "@/core/application/interfaces/order-service";

export interface HandleVnpayIpnRequest {
  ipnResponseData?: unknown;
  ipnReceivedData?: unknown;
  ipnRequestIP?: unknown;
}

export interface HandleVnpayIpnResponse {
  returnCode: number;
  returnMessage: string;
}

export class HandleVnpayIpnUseCase {
  constructor(private orderService: OrderService) {}

  async execute(request: HandleVnpayIpnRequest): Promise<HandleVnpayIpnResponse> {
    // Validate signature logic
    // Extract orderId
    // Update order status
    // Placeholder
    return { returnCode: 1, returnMessage: "Success" };
  }
}
