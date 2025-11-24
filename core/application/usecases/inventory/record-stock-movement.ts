import type { StockMovementService, StockMovementPayload } from "@/core/application/interfaces/inventory-service"
import type { StockMovement } from "@/core/domain/managements/inventory"

export interface RecordStockMovementRequest extends StockMovementPayload { }

export interface RecordStockMovementResponse {
  movement: StockMovement
}

export class RecordStockMovementUseCase {
  constructor(private stockMovementService: StockMovementService) { }

  async execute(request: RecordStockMovementRequest): Promise<RecordStockMovementResponse> {
    const movement = await this.stockMovementService.create(request)
    return { movement }
  }
}
