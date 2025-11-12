import { createHmac } from "crypto";
import type { PaymentGateway, PaymentResult } from "@/core/application/interfaces/payment-gateway";
import { orderService } from "@/lib/container";
import { notifyOrderWebhook } from "@/lib/webhook";

export interface ZaloPayStatusResponse {
  data?: {
    returnCode: 0 | 1 | -1;
    returnMessage?: string;
  };
  error?: {
    code: number;
    message: string;
  };
}

export class ZaloPayGateway implements PaymentGateway {
  private readonly API_URL = "https://payment-mini.zalo.me/api/transaction/get-status";

  async checkPaymentStatus(checkoutSdkOrderId: string, miniAppId?: string): Promise<PaymentResult> {
    try {
      const appId = (typeof miniAppId === "string" && miniAppId.trim() ? miniAppId.trim() : process.env.APP_ID) as string;
      const secretKey = process.env.CHECKOUT_SDK_PRIVATE_KEY;

      if (!appId || !secretKey) {
        console.warn("[ZaloPayGateway] Missing APP_ID or CHECKOUT_SDK_PRIVATE_KEY");
        return {
          success: false,
          status: 'pending',
          data: { error: "Missing configuration" }
        };
      }

      // Generate MAC for authentication
      const dataMac = `appId=${appId}&orderId=${checkoutSdkOrderId}&privateKey=${secretKey}`;
      const mac = createHmac("sha256", secretKey).update(dataMac).digest("hex");

      // Build API URL with parameters
      const url = new URL(this.API_URL);
      url.searchParams.set("orderId", String(checkoutSdkOrderId));
      url.searchParams.set("appId", appId);
      url.searchParams.set("mac", mac);

      console.log(`[ZaloPayGateway] Checking status for order ${checkoutSdkOrderId}`);

      // Call ZaloPay API
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(30000), // 30 seconds timeout
      });

      if (!response.ok) {
        console.error(`[ZaloPayGateway] API call failed: HTTP ${response.status}`);
        return {
          success: false,
          status: 'pending',
          data: { error: `HTTP ${response.status}` }
        };
      }

      const json: ZaloPayStatusResponse = await response.json();
      console.log(`[ZaloPayGateway] API Response:`, json);

      // Parse returnCode
      const returnCode = json?.data?.returnCode;

      if (returnCode === 1) {
        return {
          success: true,
          status: 'success',
          data: json
        };
      } else if (returnCode === -1) {
        return {
          success: false,
          status: 'failed',
          data: json
        };
      } else {
        return {
          success: false,
          status: 'pending',
          data: json
        };
      }

    } catch (error) {
      console.error('[ZaloPayGateway] Error checking payment status:', error);
      return {
        success: false,
        status: 'pending',
        data: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  async processPaymentUpdate(orderId: number, checkoutSdkOrderId: string, miniAppId?: string): Promise<void> {
    const paymentResult = await this.checkPaymentStatus(checkoutSdkOrderId, miniAppId);

    if (paymentResult.success) {
      // Update order status to success
      const updatedOrder = await orderService.update(orderId, {
        paymentStatus: 'success',
        updatedAt: new Date()
      });

      if (updatedOrder) {
        console.log(`[ZaloPayGateway] Updated order ${orderId} to success`);

        // Send webhook notification
        await notifyOrderWebhook(updatedOrder);
      }
    } else if (paymentResult.status === 'failed') {
      // Update order status to failed
      await orderService.update(orderId, {
        paymentStatus: 'failed',
        updatedAt: new Date()
      });

      console.log(`[ZaloPayGateway] Updated order ${orderId} to failed`);
    } else {
      console.log(`[ZaloPayGateway] Order ${orderId} still pending`);
    }
  }
}
