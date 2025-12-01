import type { OperationalCostService, OperationalCostPayload } from "@/core/application/interfaces/sales/operational-cost-service"
import type { OperationalCost } from "@/core/domain/sales/operational-cost"
import { validateOperationalCost } from "@/core/domain/sales/operational-cost"

export interface UpdateCostRequest extends OperationalCostPayload {
  id: number
}

export interface UpdateCostResponse {
  cost: OperationalCost | null
}

export class UpdateCostUseCase {
  constructor(private costService: OperationalCostService) {}

  async execute(request: UpdateCostRequest): Promise<UpdateCostResponse> {
    // Validate at use case level
    const errors = validateOperationalCost(request)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    if (!request.id) {
      throw new Error("Cost ID is required for update")
    }

    const cost = await this.costService.update(request)
    if (!cost) {
      throw new Error("Cost not found")
    }

    return { cost }
  }
}
