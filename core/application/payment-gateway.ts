export interface PaymentResult {
  success: boolean;
  status: 'success' | 'failed' | 'pending';
  data?: any;
}

export interface PaymentGateway {
  checkPaymentStatus(checkoutSdkOrderId: string, miniAppId?: string): Promise<PaymentResult>;
  processPaymentUpdate(orderId: number, checkoutSdkOrderId: string, miniAppId?: string): Promise<void>;
}
