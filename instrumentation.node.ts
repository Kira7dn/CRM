import { registerWorkers } from "@/infrastructure/queue/order-worker";
import { ZaloPayGateway } from "@/infrastructure/adapters/gateways/zalopay-gateway";
import { OrderRepository } from "@/infrastructure/repositories/order-repo";
import type { PaymentGateway } from "@/core/application/interfaces/payment-gateway";

export function register() {
  // Only run in Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Create dependencies
    const orderRepository = new OrderRepository();
    const paymentGateway: PaymentGateway = new ZaloPayGateway(orderRepository);

    // Register and initialize workers
    registerWorkers(paymentGateway);
  }
}
