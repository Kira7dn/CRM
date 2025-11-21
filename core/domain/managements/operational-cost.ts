export type CostCategory =
  | "order_processing"
  | "shipping"
  | "packaging"
  | "marketing"
  | "staff_salary"
  | "utilities"
  | "rent"
  | "maintenance"
  | "other"

export type CostType = "fixed" | "variable" | "one_time"

/**
 * Operational Cost domain entity
 * Tracks business operational costs for profit margin calculations
 */
export class OperationalCost {
  constructor(
    public readonly id: number,
    public category: CostCategory,
    public type: CostType,
    public amount: number,
    public description: string,
    public date: Date,
    public orderId?: number, // Link to specific order (for variable costs)
    public notes?: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  /**
   * Check if cost is order-specific
   */
  isOrderSpecific(): boolean {
    return !!this.orderId
  }

  /**
   * Get cost per day (for fixed costs)
   */
  getDailyCost(): number {
    if (this.type === "fixed") {
      // Assume monthly fixed costs
      return this.amount / 30
    }
    return 0
  }
}

/**
 * Helper to calculate total operational costs for a period
 */
export function calculatePeriodCosts(
  costs: OperationalCost[],
  startDate: Date,
  endDate: Date
): {
  total: number
  byCategory: Record<CostCategory, number>
  fixed: number
  variable: number
} {
  const filtered = costs.filter(c => {
    const costDate = new Date(c.date)
    return costDate >= startDate && costDate <= endDate
  })

  const byCategory: Record<CostCategory, number> = {
    order_processing: 0,
    shipping: 0,
    packaging: 0,
    marketing: 0,
    staff_salary: 0,
    utilities: 0,
    rent: 0,
    maintenance: 0,
    other: 0,
  }

  let fixed = 0
  let variable = 0

  filtered.forEach(cost => {
    byCategory[cost.category] += cost.amount
    if (cost.type === "fixed") {
      fixed += cost.amount
    } else {
      variable += cost.amount
    }
  })

  const total = Object.values(byCategory).reduce((sum, val) => sum + val, 0)

  return { total, byCategory, fixed, variable }
}

/**
 * Calculate cost per order
 */
export function calculateOrderCost(
  costs: OperationalCost[],
  orderId: number
): number {
  return costs
    .filter(c => c.orderId === orderId)
    .reduce((sum, c) => sum + c.amount, 0)
}

/**
 * Validation function for OperationalCost entity
 */
export function validateOperationalCost(data: Partial<OperationalCost>): string[] {
  const errors: string[] = []

  if (!data.category) {
    errors.push("Cost category is required")
  }

  if (!data.type) {
    errors.push("Cost type is required")
  }

  if (!data.amount || data.amount <= 0) {
    errors.push("Amount must be positive")
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push("Description is required")
  }

  if (!data.date) {
    errors.push("Date is required")
  }

  return errors
}
