import type { InventoryConfigService, InventoryConfigPayload } from "@/core/application/interfaces/inventory-config-service"
import type { InventoryConfig } from "@/core/domain/managements/inventory"

export interface UpdateInventoryConfigRequest extends InventoryConfigPayload {}

export interface UpdateInventoryConfigResponse {
  config: InventoryConfig | null
}

export class UpdateInventoryConfigUseCase {
  constructor(private inventoryConfigService: InventoryConfigService) {}

  async execute(request: UpdateInventoryConfigRequest): Promise<UpdateInventoryConfigResponse> {
    // If config doesn't exist, create it
    if (request.productId) {
      const existing = await this.inventoryConfigService.getByProductId(request.productId)
      if (!existing) {
        const config = await this.inventoryConfigService.create(request)
        return { config }
      }
    }

    const config = await this.inventoryConfigService.update(request)
    return { config }
  }
}
