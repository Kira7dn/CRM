import type { InventoryConfig } from "@/core/domain/managements/inventory"

export interface InventoryConfigPayload extends Partial<InventoryConfig> {}

export interface InventoryConfigService {
  // Create new inventory config
  create(payload: InventoryConfigPayload): Promise<InventoryConfig>

  // Get all configs
  getAll(): Promise<InventoryConfig[]>

  // Get config by product
  getByProductId(productId: number): Promise<InventoryConfig | null>

  // Update config
  update(payload: InventoryConfigPayload): Promise<InventoryConfig | null>

  // Delete config
  delete(id: number): Promise<boolean>
}
