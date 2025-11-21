export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock" | "discontinued"

export interface StockMovement {
  type: "in" | "out" | "adjustment" | "return"
  quantity: number
  reason: string
  performedBy?: string
  timestamp: Date
  referenceOrderId?: number
  notes?: string
}

/**
 * Inventory domain entity
 * Tracks stock levels and movements for products
 */
export class Inventory {
  constructor(
    public readonly id: number,
    public productId: number, // Reference to Product
    public currentStock: number,
    public reservedStock: number, // Stock reserved for pending orders
    public availableStock: number, // currentStock - reservedStock
    public reorderPoint: number, // Minimum stock before alert
    public reorderQuantity: number, // Quantity to reorder
    public status: InventoryStatus,
    public movements: StockMovement[], // Stock movement history
    public lastRestockedAt?: Date,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  /**
   * Check if stock is low (below reorder point)
   */
  isLowStock(): boolean {
    return this.availableStock <= this.reorderPoint && this.availableStock > 0
  }

  /**
   * Check if out of stock
   */
  isOutOfStock(): boolean {
    return this.availableStock <= 0
  }

  /**
   * Calculate stock turnover rate (movements in last 30 days)
   */
  getStockTurnover(): number {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentMovements = this.movements.filter(
      m => m.type === "out" && new Date(m.timestamp) >= thirtyDaysAgo
    )

    const totalSold = recentMovements.reduce((sum, m) => sum + m.quantity, 0)
    return totalSold
  }

  /**
   * Get days of stock remaining based on average daily sales
   */
  getDaysOfStockRemaining(): number | null {
    const turnover = this.getStockTurnover()
    if (turnover === 0) return null

    const avgDailySales = turnover / 30
    return Math.floor(this.availableStock / avgDailySales)
  }

  /**
   * Update stock status based on current levels
   */
  updateStatus(): InventoryStatus {
    if (this.status === "discontinued") return "discontinued"
    if (this.availableStock <= 0) return "out_of_stock"
    if (this.availableStock <= this.reorderPoint) return "low_stock"
    return "in_stock"
  }
}

/**
 * Helper to add stock movement
 */
export function addStockMovement(
  inventory: Inventory,
  movement: Omit<StockMovement, "timestamp">
): Inventory {
  const newMovement: StockMovement = {
    ...movement,
    timestamp: new Date(),
  }

  inventory.movements.push(newMovement)

  // Update current stock based on movement type
  if (movement.type === "in" || movement.type === "return") {
    inventory.currentStock += movement.quantity
  } else if (movement.type === "out") {
    inventory.currentStock -= movement.quantity
  } else if (movement.type === "adjustment") {
    inventory.currentStock = movement.quantity // Direct adjustment
  }

  // Recalculate available stock
  inventory.availableStock = inventory.currentStock - inventory.reservedStock

  // Update status
  inventory.status = inventory.updateStatus()

  // Update timestamp
  inventory.updatedAt = new Date()
  if (movement.type === "in") {
    inventory.lastRestockedAt = new Date()
  }

  return inventory
}

/**
 * Reserve stock for order
 */
export function reserveStock(inventory: Inventory, quantity: number): boolean {
  if (inventory.availableStock < quantity) {
    return false
  }

  inventory.reservedStock += quantity
  inventory.availableStock = inventory.currentStock - inventory.reservedStock
  inventory.status = inventory.updateStatus()
  inventory.updatedAt = new Date()

  return true
}

/**
 * Release reserved stock (order cancelled)
 */
export function releaseReservedStock(inventory: Inventory, quantity: number): void {
  inventory.reservedStock = Math.max(0, inventory.reservedStock - quantity)
  inventory.availableStock = inventory.currentStock - inventory.reservedStock
  inventory.status = inventory.updateStatus()
  inventory.updatedAt = new Date()
}

/**
 * Validation function for Inventory entity
 */
export function validateInventory(data: Partial<Inventory>): string[] {
  const errors: string[] = []

  if (!data.productId) {
    errors.push("Product ID is required")
  }

  if (data.currentStock !== undefined && data.currentStock < 0) {
    errors.push("Current stock cannot be negative")
  }

  if (data.reservedStock !== undefined && data.reservedStock < 0) {
    errors.push("Reserved stock cannot be negative")
  }

  if (data.reorderPoint !== undefined && data.reorderPoint < 0) {
    errors.push("Reorder point cannot be negative")
  }

  if (data.reorderQuantity !== undefined && data.reorderQuantity <= 0) {
    errors.push("Reorder quantity must be positive")
  }

  return errors
}
