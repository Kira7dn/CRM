import type { OrderService } from "@/core/application/interfaces/sales/order-service";
import type { Order } from "@/core/domain/sales/order";

export interface GetOrderByIdRequest {
  id: number;
}

export interface GetOrderByIdResponse {
  order: Order | null;
}

export class GetOrderByIdUseCase {
  constructor(private orderService: OrderService) { }

  async execute(request: GetOrderByIdRequest): Promise<GetOrderByIdResponse> {
    const order = await this.orderService.getById(request.id);
    return { order };
  }
}
