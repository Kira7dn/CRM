import type { StockMovementService } from "@/core/application/interfaces/catalog/inventory-service"
import type { StockMovement } from "@/core/domain/catalog/inventory"

export interface GetStockMovementsRequest {
  productId?: number
}

export interface GetStockMovementsResponse {
  movements: StockMovement[]
}

export class GetStockMovementsUseCase {
  constructor(private stockMovementService: StockMovementService) { }

  async execute(request: GetStockMovementsRequest = {}): Promise<GetStockMovementsResponse> {
    const movements = request.productId
      ? await this.stockMovementService.getByProductId(request.productId)
      : await this.stockMovementService.getAll()

    return { movements }
  }
}
