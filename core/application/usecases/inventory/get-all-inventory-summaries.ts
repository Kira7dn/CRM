import type { StockMovementService } from "@/core/application/interfaces/inventory-service"
import type { InventorySummary } from "@/core/domain/managements/inventory"

export interface GetAllInventorySummariesResponse {
  summaries: InventorySummary[]
}

export class GetAllInventorySummariesUseCase {
  constructor(private stockMovementService: StockMovementService) { }

  async execute(): Promise<GetAllInventorySummariesResponse> {
    const summaries = await this.stockMovementService.getAllInventorySummaries()
    return { summaries }
  }
}
