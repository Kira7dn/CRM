import type { StockMovementService } from "@/core/application/interfaces/catalog/inventory-service"
import type { InventorySummary } from "@/core/domain/catalog/inventory"

export interface GetInventorySummaryRequest {
  productId: number
}

export interface GetInventorySummaryResponse {
  summary: InventorySummary | null
}

export class GetInventorySummaryUseCase {
  constructor(private stockMovementService: StockMovementService) { }

  async execute(request: GetInventorySummaryRequest): Promise<GetInventorySummaryResponse> {
    const summary = await this.stockMovementService.getInventorySummary(request.productId)
    return { summary }
  }
}
