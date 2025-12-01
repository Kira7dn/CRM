import type { OrderService } from "@/core/application/interfaces/sales/order-service";

export interface DeleteOrderRequest {
  id: number;
}

export interface DeleteOrderResponse {
  success: boolean;
}

export class DeleteOrderUseCase {
  constructor(private orderService: OrderService) {}

  async execute(request: DeleteOrderRequest): Promise<DeleteOrderResponse> {
    const success = await this.orderService.delete(request.id);
    return { success };
  }
}
