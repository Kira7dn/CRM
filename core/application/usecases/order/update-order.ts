import type { OrderService, OrderPayload } from "@/core/application/interfaces/order-service";
import type { Order } from "@/core/domain/managements/order";

export interface UpdateOrderRequest {
  id: number;
  payload: OrderPayload;
}

export interface UpdateOrderResponse {
  order: Order | null;
}

export class UpdateOrderUseCase {
  constructor(private orderService: OrderService) { }

  async execute(request: UpdateOrderRequest): Promise<UpdateOrderResponse> {
    const order = await this.orderService.update({ id: request.id, ...request.payload });
    return { order };
  }
}
