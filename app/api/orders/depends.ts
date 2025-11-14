import { OrderRepository } from '@/infrastructure/repositories/order-repo';
import { BullMQAdapter } from '@/infrastructure/queue/bullmq-adapter';
import { ZaloPayGateway } from '@/infrastructure/gateways/zalopay-gateway';
import type { OrderService } from '@/core/application/interfaces/order-service';
import { GetOrdersUseCase } from '@/core/application/usecases/order/get-orders';
import { CreateOrderUseCase } from '@/core/application/usecases/order/create-order';
import { GetOrderByIdUseCase } from '@/core/application/usecases/order/get-order-by-id';
import { UpdateOrderUseCase } from '@/core/application/usecases/order/update-order';
import { DeleteOrderUseCase } from '@/core/application/usecases/order/delete-order';
import { LinkOrderUseCase } from '@/core/application/usecases/order/link-order';
import { PaymentCallbackUseCase } from '@/core/application/usecases/order/payment-callback';
import { CheckPaymentStatusUseCase } from '@/core/application/usecases/order/check-payment-status';
import { CheckOrderStatusUseCase } from '@/core/application/usecases/order/check-order-status';
import { MacRequestUseCase } from '@/core/application/usecases/order/mac-request';
import { HandleVnpayIpnUseCase } from '@/core/application/usecases/order/handle-vnpay-ipn';
import { VnpayGatewayImpl } from '@/infrastructure/gateways/vnpay-gateway';

// Shared repository instance creator
const createOrderRepository = async (): Promise<OrderService> => {
  return new OrderRepository();
};

// Shared dependency creators
const createQueueService = async () => new BullMQAdapter();
const createPaymentGateway = async () => {
  const orderService = await createOrderRepository();
  return new ZaloPayGateway(orderService);
};

// Shared VNPAY gateway creator
const createVnpayGateway = async () => new VnpayGatewayImpl();

// Create use case instances
export const getOrdersUseCase = async () => {
  const orderService = await createOrderRepository();
  return new GetOrdersUseCase(orderService);
};

export const createOrderUseCase = async () => {
  const orderService = await createOrderRepository();
  return new CreateOrderUseCase(orderService);
};

export const getOrderByIdUseCase = async () => {
  const orderService = await createOrderRepository();
  return new GetOrderByIdUseCase(orderService);
};

export const updateOrderUseCase = async () => {
  const orderService = await createOrderRepository();
  return new UpdateOrderUseCase(orderService);
};

export const deleteOrderUseCase = async () => {
  const orderService = await createOrderRepository();
  return new DeleteOrderUseCase(orderService);
};

export const linkOrderUseCase = async () => {
  const orderService = await createOrderRepository();
  const queueService = await createQueueService();
  return new LinkOrderUseCase(orderService, queueService);
};

export const paymentCallbackUseCase = async () => {
  const orderService = await createOrderRepository();
  return new PaymentCallbackUseCase(orderService);
};

export const checkPaymentStatusUseCase = async () => {
  const paymentGateway = await createPaymentGateway();
  const queueService = await createQueueService();
  return new CheckPaymentStatusUseCase(paymentGateway, queueService);
};

export const checkOrderStatusUseCase = async () => {
  const orderService = await createOrderRepository();
  return new CheckOrderStatusUseCase(orderService);
};

export const macRequestUseCase = async () => {
  return new MacRequestUseCase();
};

export const handleVnpayIpnUseCase = async () => new HandleVnpayIpnUseCase(
  await createVnpayGateway(),
  await createOrderRepository()
);
