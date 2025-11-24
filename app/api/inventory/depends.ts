import { InventoryRepository } from "@/infrastructure/repositories/inventory-repo"
import { InventoryConfigRepository } from "@/infrastructure/repositories/inventory-config-repo"

// Stock Movement Use Cases
import { RecordStockMovementUseCase } from "@/core/application/usecases/inventory/record-stock-movement"
import { GetStockMovementsUseCase } from "@/core/application/usecases/inventory/get-stock-movements"
import { GetInventorySummaryUseCase } from "@/core/application/usecases/inventory/get-inventory-summary"
import { GetAllInventorySummariesUseCase } from "@/core/application/usecases/inventory/get-all-inventory-summaries"

// Inventory Config Use Cases
import { UpdateInventoryConfigUseCase } from "@/core/application/usecases/inventory/update-inventory-config"

// Stock Movement Use Case Factories
export const recordStockMovementUseCase = async () => {
  const repo = new InventoryRepository()
  return new RecordStockMovementUseCase(repo)
}

export const getStockMovementsUseCase = async () => {
  const repo = new InventoryRepository()
  return new GetStockMovementsUseCase(repo)
}

export const getInventorySummaryUseCase = async () => {
  const repo = new InventoryRepository()
  return new GetInventorySummaryUseCase(repo)
}

export const getAllInventorySummariesUseCase = async () => {
  const repo = new InventoryRepository()
  return new GetAllInventorySummariesUseCase(repo)
}

// Inventory Config Use Case Factories
export const updateInventoryConfigUseCase = async () => {
  const repo = new InventoryConfigRepository()
  return new UpdateInventoryConfigUseCase(repo)
}
