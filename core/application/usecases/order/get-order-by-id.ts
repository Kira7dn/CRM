import type { OrderService } from "@/core/application/interfaces/order-service";

export interface GetOrderByIdRequest {
  id: number;
}

export interface GetOrderByIdResponse {
  order: any | null;
}

export class GetOrderByIdUseCase {
  constructor(private orderService: OrderService) {}

  async execute(request: GetOrderByIdRequest): Promise<GetOrderByIdResponse> {
    const order = await this.orderService.getById(request.id);
    return { order };
  }
}
