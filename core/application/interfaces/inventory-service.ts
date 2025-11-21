import type { Inventory, StockMovement } from "@/core/domain/managements/inventory"

export interface InventoryPayload extends Partial<Inventory> {}

export interface InventoryService {
  getAll(): Promise<Inventory[]>
  getById(id: number): Promise<Inventory | null>
  getByProductId(productId: number): Promise<Inventory | null>
  getLowStockItems(): Promise<Inventory[]>
  getOutOfStockItems(): Promise<Inventory[]>
  create(payload: InventoryPayload): Promise<Inventory>
  update(payload: InventoryPayload): Promise<Inventory | null>
  delete(id: number): Promise<boolean>
  addStockMovement(inventoryId: number, movement: Omit<StockMovement, "timestamp">): Promise<Inventory | null>
  reserveStock(inventoryId: number, quantity: number): Promise<boolean>
  releaseStock(inventoryId: number, quantity: number): Promise<boolean>
}
