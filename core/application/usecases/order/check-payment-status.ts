import type { PaymentGateway } from '@/core/application/interfaces/payment-gateway';
import type { QueueService } from '@/core/application/interfaces/queue-service';

export interface CheckPaymentStatusRequest {
  orderId: number;
  checkoutSdkOrderId: string;
  miniAppId?: string;
}

export interface CheckPaymentStatusResponse {
  success: boolean;
  message: string;
}

export class CheckPaymentStatusUseCase {
  constructor(
    private paymentGateway: PaymentGateway,
    private queueService: QueueService
  ) {}

  async execute(request: CheckPaymentStatusRequest): Promise<CheckPaymentStatusResponse> {
    const { orderId, checkoutSdkOrderId, miniAppId } = request;

    try {
      // Check payment status immediately
      const result = await this.paymentGateway.checkPaymentStatus(checkoutSdkOrderId, miniAppId);

      if (result.success) {
        // Process successful payment
        await this.paymentGateway.processPaymentUpdate(orderId, checkoutSdkOrderId, miniAppId);
        return {
          success: true,
          message: 'Payment processed successfully'
        };
      } else if (result.status === 'failed') {
        // Process failed payment
        await this.paymentGateway.processPaymentUpdate(orderId, checkoutSdkOrderId, miniAppId);
        return {
          success: false,
          message: 'Payment failed'
        };
      } else {
        // Schedule delayed check
        await this.queueService.addJob(
          'orders',
          'checkPaymentStatus',
          {
            type: 'checkPaymentStatus',
            data: { orderId, checkoutSdkOrderId, miniAppId }
          },
          { delay: 20 * 60 * 1000 } // 20 minutes
        );

        return {
          success: true,
          message: 'Payment check scheduled'
        };
      }
    } catch (error) {
      console.error('[CheckPaymentStatusUseCase] Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
