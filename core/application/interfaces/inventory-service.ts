import type { StockMovement, InventorySummary, MovementType } from "@/core/domain/managements/inventory"

export interface StockMovementPayload extends Partial<StockMovement> { }

export interface StockMovementService {
  // Create new stock movement
  create(payload: StockMovementPayload): Promise<StockMovement>

  // Get all movements
  getAll(): Promise<StockMovement[]>

  // Get movements by product
  getByProductId(productId: number): Promise<StockMovement[]>

  // Get movements by date range
  getByDateRange(startDate: Date, endDate: Date): Promise<StockMovement[]>

  // Get movements by type
  getByType(type: MovementType): Promise<StockMovement[]>

  // Get movement by ID
  getById(id: number): Promise<StockMovement | null>

  // Calculate inventory summary for a product
  getInventorySummary(productId: number): Promise<InventorySummary | null>

  // Calculate inventory summaries for all products
  getAllInventorySummaries(): Promise<InventorySummary[]>

  // Delete movement (admin only, for corrections)
  delete(id: number): Promise<boolean>
}
