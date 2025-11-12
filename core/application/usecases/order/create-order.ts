import type { OrderService, CreateOrderPayload } from "@/core/application/interfaces/order-service";

export interface CreateOrderRequest extends CreateOrderPayload {}

export interface CreateOrderResponse {
  order: any;
}

export class CreateOrderUseCase {
  constructor(private orderService: OrderService) {}

  async execute(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    const order = await this.orderService.create(request);
    return { order };
  }
}
