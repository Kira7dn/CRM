import type { OperationalCost, CostCategory } from "@/core/domain/managements/operational-cost"

export interface OperationalCostPayload extends Partial<OperationalCost> {}

export interface OperationalCostService {
  getAll(): Promise<OperationalCost[]>
  getById(id: number): Promise<OperationalCost | null>
  getByDateRange(startDate: Date, endDate: Date): Promise<OperationalCost[]>
  getByCategory(category: CostCategory): Promise<OperationalCost[]>
  getByOrderId(orderId: number): Promise<OperationalCost[]>
  create(payload: OperationalCostPayload): Promise<OperationalCost>
  update(payload: OperationalCostPayload): Promise<OperationalCost | null>
  delete(id: number): Promise<boolean>
}
