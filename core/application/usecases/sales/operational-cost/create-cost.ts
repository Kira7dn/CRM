import type { OperationalCostService, OperationalCostPayload } from "@/core/application/interfaces/sales/operational-cost-service"
import type { OperationalCost } from "@/core/domain/sales/operational-cost"
import { validateOperationalCost } from "@/core/domain/sales/operational-cost"

export interface CreateCostRequest extends OperationalCostPayload {}

export interface CreateCostResponse {
  cost: OperationalCost
}

export class CreateCostUseCase {
  constructor(private costService: OperationalCostService) {}

  async execute(request: CreateCostRequest): Promise<CreateCostResponse> {
    // Validate at use case level
    const errors = validateOperationalCost(request)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const cost = await this.costService.create(request)
    return { cost }
  }
}
