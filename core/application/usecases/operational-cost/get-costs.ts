import type { OperationalCostService } from "@/core/application/interfaces/operational-cost-service"
import type { OperationalCost } from "@/core/domain/managements/operational-cost"

export interface GetCostsRequest {
  // Optional filters
}

export interface GetCostsResponse {
  costs: OperationalCost[]
}

export class GetCostsUseCase {
  constructor(private costService: OperationalCostService) {}

  async execute(request: GetCostsRequest = {}): Promise<GetCostsResponse> {
    const costs = await this.costService.getAll()
    return { costs }
  }
}
