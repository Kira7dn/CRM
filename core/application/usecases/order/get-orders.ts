import type { OrderService } from "@/core/application/interfaces/order-service";

export interface GetOrdersRequest {
  status?: string;
  zaloUserId?: string;
}

export interface GetOrdersResponse {
  orders: any[];
}

export class GetOrdersUseCase {
  constructor(private orderService: OrderService) {}

  async execute(request: GetOrdersRequest): Promise<GetOrdersResponse> {
    const orders = await this.orderService.getAll(request as any);
    return { orders };
  }
}
