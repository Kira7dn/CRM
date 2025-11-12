import type { OrderService, UpdateOrderPayload } from "@/core/application/interfaces/order-service";

export interface UpdateOrderRequest {
  id: number;
  payload: UpdateOrderPayload;
}

export interface UpdateOrderResponse {
  order: any | null;
}

export class UpdateOrderUseCase {
  constructor(private orderService: OrderService) {}

  async execute(request: UpdateOrderRequest): Promise<UpdateOrderResponse> {
    const order = await this.orderService.update(request.id, request.payload);
    return { order };
  }
}
