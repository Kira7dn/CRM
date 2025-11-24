export type MovementType = "in" | "out" | "adjustment" | "return"

/**
 * Stock Movement domain entity - Each record represents a transaction
 * This is the primary entity for tracking inventory
 */
export class StockMovement {
  constructor(
    public readonly id: number,
    public productId: number, // Reference to Product
    public type: MovementType, // Type of movement
    public quantity: number, // Quantity (always positive, type determines direction)
    public unitCost: number, // Cost per unit at time of movement (for COGS)
    public referenceOrderId?: number, // Link to order if applicable
    public reason?: string, // Description of movement
    public performedBy?: string, // Who performed the movement
    public notes?: string, // Additional notes
    public readonly createdAt: Date = new Date()
  ) { }
}

/**
 * Inventory summary - Calculated from stock movements
 * Not stored as entity, computed on demand
 */
export interface InventorySummary {
  productId: number
  totalIn: number // Sum of all "in" movements
  totalOut: number // Sum of all "out" movements
  currentStock: number // totalIn - totalOut
  averageCost: number // Weighted average cost
  totalValue: number // currentStock * averageCost
  lastMovementDate?: Date
  reorderPoint: number // Configuration
  reorderQuantity: number // Configuration
}

/**
 * Product inventory configuration
 * Stores reorder settings per product
 */
export class InventoryConfig {
  constructor(
    public readonly id: number,
    public productId: number,
    public reorderPoint: number, // Minimum stock before alert
    public reorderQuantity: number, // Quantity to reorder
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) { }
}

/**
 * Calculate inventory summary from stock movements
 */
export function calculateInventorySummary(
  movements: StockMovement[],
  config?: InventoryConfig
): InventorySummary {
  let totalIn = 0
  let totalOut = 0
  let totalCostValue = 0
  let totalInQuantity = 0
  let lastMovementDate: Date | undefined

  for (const movement of movements) {
    if (movement.type === "in" || movement.type === "return") {
      totalIn += movement.quantity
      totalCostValue += movement.quantity * movement.unitCost
      totalInQuantity += movement.quantity
    } else if (movement.type === "out") {
      totalOut += movement.quantity
    } else if (movement.type === "adjustment") {
      // Adjustment resets the stock to a specific value
      totalIn = movement.quantity
      totalOut = 0
      totalCostValue = movement.quantity * movement.unitCost
      totalInQuantity = movement.quantity
    }

    if (!lastMovementDate || movement.createdAt > lastMovementDate) {
      lastMovementDate = movement.createdAt
    }
  }

  const currentStock = totalIn - totalOut
  const averageCost = totalInQuantity > 0 ? totalCostValue / totalInQuantity : 0
  const totalValue = currentStock * averageCost

  return {
    productId: movements[0]?.productId || 0,
    totalIn,
    totalOut,
    currentStock,
    averageCost,
    totalValue,
    lastMovementDate,
    reorderPoint: config?.reorderPoint || 0,
    reorderQuantity: config?.reorderQuantity || 0,
  }
}

/**
 * Check if stock is low based on summary
 */
export function isLowStock(summary: InventorySummary): boolean {
  return summary.currentStock > 0 && summary.currentStock <= summary.reorderPoint
}

/**
 * Check if out of stock based on summary
 */
export function isOutOfStock(summary: InventorySummary): boolean {
  return summary.currentStock <= 0
}

/**
 * Validation function for StockMovement
 */
export function validateStockMovement(data: Partial<StockMovement>): string[] {
  const errors: string[] = []

  if (!data.productId) {
    errors.push("Product ID is required")
  }

  if (!data.type) {
    errors.push("Movement type is required")
  }

  if (data.quantity === undefined || data.quantity <= 0) {
    errors.push("Quantity must be positive")
  }

  if (data.unitCost === undefined || data.unitCost < 0) {
    errors.push("Unit cost cannot be negative")
  }

  return errors
}

/**
 * Validation function for InventoryConfig
 */
export function validateInventoryConfig(data: Partial<InventoryConfig>): string[] {
  const errors: string[] = []

  if (!data.productId) {
    errors.push("Product ID is required")
  }

  if (data.reorderPoint !== undefined && data.reorderPoint < 0) {
    errors.push("Reorder point cannot be negative")
  }

  if (data.reorderQuantity !== undefined && data.reorderQuantity <= 0) {
    errors.push("Reorder quantity must be positive")
  }

  return errors
}
