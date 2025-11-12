import { createHmac } from "crypto";
import { orderService } from './container';
import { notifyOrderWebhook } from './webhook';

export interface PaymentGatewayResponse {
  success: boolean;
  status: 'success' | 'failed' | 'pending';
  data?: any;
}

export interface ZaloPayStatusResponse {
  data?: {
    returnCode: 0 | 1 | -1; // 1 = success, -1 = failed, 0 = processing
    returnMessage?: string;
  };
  error?: {
    code: number;
    message: string;
  };
}

export class PaymentGatewayService {
  private readonly ZALOPAY_API_URL = "https://payment-mini.zalo.me/api/transaction/get-status";

  /**
   * Check payment status from ZaloPay API with MAC authentication
   */
  async checkPaymentStatus(checkoutSdkOrderId: string, miniAppId?: string): Promise<PaymentGatewayResponse> {
    try {
      const appId = (typeof miniAppId === "string" && miniAppId.trim() ? miniAppId.trim() : process.env.APP_ID) as string;
      const secretKey = process.env.CHECKOUT_SDK_PRIVATE_KEY;

      if (!appId || !secretKey) {
        console.warn("[PaymentGateway] Missing APP_ID or CHECKOUT_SDK_PRIVATE_KEY");
        return {
          success: false,
          status: 'pending',
          data: { error: "Missing configuration" }
        };
      }

      // Generate MAC for authentication (same as backend)
      const dataMac = `appId=${appId}&orderId=${checkoutSdkOrderId}&privateKey=${secretKey}`;
      const mac = createHmac("sha256", secretKey).update(dataMac).digest("hex");

      // Build API URL with parameters
      const url = new URL(this.ZALOPAY_API_URL);
      url.searchParams.set("orderId", String(checkoutSdkOrderId));
      url.searchParams.set("appId", appId);
      url.searchParams.set("mac", mac);

      console.log(`[PaymentGateway] Checking status for order ${checkoutSdkOrderId}`);

      // Call ZaloPay API
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(30000), // 30 seconds timeout
      });

      if (!response.ok) {
        console.error(`[PaymentGateway] API call failed: HTTP ${response.status}`);
        return {
          success: false,
          status: 'pending',
          data: { error: `HTTP ${response.status}` }
        };
      }

      const json: ZaloPayStatusResponse = await response.json();
      console.log(`[PaymentGateway] API Response:`, json);

      // Parse returnCode
      const returnCode = json?.data?.returnCode;

      if (returnCode === 1) {
        // Payment successful
        return {
          success: true,
          status: 'success',
          data: json
        };
      } else if (returnCode === -1) {
        // Payment failed
        return {
          success: false,
          status: 'failed',
          data: json
        };
      } else {
        // Still processing or unknown status
        return {
          success: false,
          status: 'pending',
          data: json
        };
      }

    } catch (error) {
      console.error('[PaymentGateway] Error checking payment status:', error);
      return {
        success: false,
        status: 'pending',
        data: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  /**
   * Process payment status update
   */
  async processPaymentUpdate(orderId: number, checkoutSdkOrderId: string, miniAppId?: string): Promise<void> {
    const paymentResult = await this.checkPaymentStatus(checkoutSdkOrderId, miniAppId);

    if (paymentResult.success) {
      // Update order status to success
      const updatedOrder = await orderService.update(orderId, {
        paymentStatus: 'success',
        updatedAt: new Date()
      });

      if (updatedOrder) {
        console.log(`[PaymentGateway] Updated order ${orderId} to success`);

        // Send webhook notification
        await notifyOrderWebhook(updatedOrder);
      }
    } else if (paymentResult.status === 'failed') {
      // Update order status to failed
      await orderService.update(orderId, {
        paymentStatus: 'failed',
        updatedAt: new Date()
      });

      console.log(`[PaymentGateway] Updated order ${orderId} to failed`);
    } else {
      console.log(`[PaymentGateway] Order ${orderId} still pending`);
    }
  }
}

export const paymentGatewayService = new PaymentGatewayService();
