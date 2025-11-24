import { BaseRepository } from "@/infrastructure/db/base-repository"
import {
  StockMovement,
  InventorySummary,
  InventoryConfig,
  MovementType,
  calculateInventorySummary,
  validateStockMovement
} from "@/core/domain/managements/inventory"
import type { StockMovementService, StockMovementPayload } from "@/core/application/interfaces/inventory-service"
import { getNextId } from "@/infrastructure/db/auto-increment"
import { InventoryConfigRepository } from "./inventory-config-repo"

export class InventoryRepository extends BaseRepository<StockMovement, number> implements StockMovementService {
  protected collectionName = "stock_movements"

  async create(payload: StockMovementPayload): Promise<StockMovement> {
    const errors = validateStockMovement(payload)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`)
    }

    const client = await this.getClient()
    const id = await getNextId(client, this.collectionName)
    const collection = await this.getCollection()

    const movement = new StockMovement(
      id,
      payload.productId!,
      payload.type!,
      payload.quantity!,
      payload.unitCost!,
      payload.referenceOrderId,
      payload.reason,
      payload.performedBy,
      payload.notes,
      new Date()
    )

    const doc = this.toDocument(movement)
    await collection.insertOne(doc as any)

    return movement
  }

  async getAll(): Promise<StockMovement[]> {
    const collection = await this.getCollection()
    const docs = await collection.find({}).sort({ createdAt: -1 }).toArray()
    return docs.map(doc => this.toDomain(doc))
  }

  async getByProductId(productId: number): Promise<StockMovement[]> {
    const collection = await this.getCollection()
    const docs = await collection.find({ productId }).sort({ createdAt: -1 }).toArray()
    return docs.map(doc => this.toDomain(doc))
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<StockMovement[]> {
    const collection = await this.getCollection()
    const docs = await collection.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ createdAt: -1 }).toArray()
    return docs.map(doc => this.toDomain(doc))
  }

  async getByType(type: MovementType): Promise<StockMovement[]> {
    const collection = await this.getCollection()
    const docs = await collection.find({ type }).sort({ createdAt: -1 }).toArray()
    return docs.map(doc => this.toDomain(doc))
  }

  async getById(id: number): Promise<StockMovement | null> {
    const collection = await this.getCollection()
    const doc = await collection.findOne({ _id: id } as any)
    return doc ? this.toDomain(doc) : null
  }

  async delete(id: number): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: id } as any)
    return result.deletedCount === 1
  }

  async getInventorySummary(productId: number): Promise<InventorySummary | null> {
    const movements = await this.getByProductId(productId)
    if (movements.length === 0) return null

    const configRepo = new InventoryConfigRepository()
    const config = await configRepo.getByProductId(productId)

    return calculateInventorySummary(movements, config || undefined)
  }

  async getAllInventorySummaries(): Promise<InventorySummary[]> {
    const collection = await this.getCollection()

    // Get all unique product IDs
    const productIds = await collection.distinct("productId")

    const summaries: InventorySummary[] = []
    const configRepo = new InventoryConfigRepository()
    const configs = await configRepo.getAll()
    const configMap = new Map(configs.map(c => [c.productId, c]))

    for (const productId of productIds) {
      const movements = await this.getByProductId(productId)
      if (movements.length > 0) {
        const config = configMap.get(productId)
        summaries.push(calculateInventorySummary(movements, config))
      }
    }

    return summaries
  }

  protected toDomain(doc: any): StockMovement {
    return new StockMovement(
      this.convertId(doc._id),
      doc.productId,
      doc.type,
      doc.quantity,
      doc.unitCost,
      doc.referenceOrderId,
      doc.reason,
      doc.performedBy,
      doc.notes,
      new Date(doc.createdAt)
    )
  }

  /**
   * Get all inventory items that are below their reorder point
   */
  async getLowStockItems(): Promise<InventorySummary[]> {
    const summaries = await this.getAllInventorySummaries()
    return summaries.filter(summary =>
      summary.currentStock > 0 && // Not out of stock
      summary.currentStock <= summary.reorderPoint && // Below or at reorder point
      summary.reorderPoint > 0 // Has a reorder point set
    )
  }

  /**
   * Get all inventory items that are out of stock
   */
  async getOutOfStockItems(): Promise<InventorySummary[]> {
    const summaries = await this.getAllInventorySummaries()
    return summaries.filter(summary => summary.currentStock <= 0)
  }

  protected toDocument(domain: StockMovement): Record<string, unknown> {
    return {
      _id: domain.id,
      productId: domain.productId,
      type: domain.type,
      quantity: domain.quantity,
      unitCost: domain.unitCost,
      referenceOrderId: domain.referenceOrderId,
      reason: domain.reason,
      performedBy: domain.performedBy,
      notes: domain.notes,
      createdAt: domain.createdAt,
    }
  }
}
