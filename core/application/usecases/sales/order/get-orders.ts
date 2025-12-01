import type { OrderService } from "@/core/application/interfaces/sales/order-service";
import type { Order, OrderStatus } from "@/core/domain/sales/order";

export interface GetOrdersRequest {
  status?: OrderStatus;
  customerId?: string;
  platformSource?: string;
}

export interface GetOrdersResponse {
  orders: Order[];
}

export class GetOrdersUseCase {
  constructor(private orderService: OrderService) { }

  async execute(request: GetOrdersRequest = {}): Promise<GetOrdersResponse> {
    const orders = await this.orderService.getAll({
      status: request.status,
      customerId: request.customerId,
      platformSource: request.platformSource,
    });
    return { orders };
  }
}
