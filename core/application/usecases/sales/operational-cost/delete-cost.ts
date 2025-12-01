import type { OperationalCostService } from "@/core/application/interfaces/sales/operational-cost-service"

export interface DeleteCostRequest {
  id: number
}

export interface DeleteCostResponse {
  success: boolean
}

export class DeleteCostUseCase {
  constructor(private costService: OperationalCostService) {}

  async execute(request: DeleteCostRequest): Promise<DeleteCostResponse> {
    if (!request.id) {
      throw new Error("Cost ID is required")
    }

    const success = await this.costService.delete(request.id)
    if (!success) {
      throw new Error("Cost not found or could not be deleted")
    }

    return { success }
  }
}
