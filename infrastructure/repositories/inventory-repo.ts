import { BaseRepository } from "@/infrastructure/db/base-repository"
import { Inventory, StockMovement, addStockMovement, reserveStock, releaseReservedStock, validateInventory } from "@/core/domain/managements/inventory"
import type { InventoryService, InventoryPayload } from "@/core/application/interfaces/inventory-service"
import { getNextId } from "@/infrastructure/db/auto-increment"

export class InventoryRepository extends BaseRepository<Inventory, number> implements InventoryService {
  protected collectionName = "inventory"

  async getAll(): Promise<Inventory[]> {
    const collection = await this.getCollection()
    const docs = await collection.find({}).sort({ _id: 1 }).toArray()
    return docs.map(doc => this.toDomain(doc))
  }

  async getById(id: number): Promise<Inventory | null> {
    const collection = await this.getCollection()
    const doc = await collection.findOne({ _id: id } as any)
    return doc ? this.toDomain(doc) : null
  }

  async getByProductId(productId: number): Promise<Inventory | null> {
    const collection = await this.getCollection()
    const doc = await collection.findOne({ productId })
    return doc ? this.toDomain(doc) : null
  }

  async getLowStockItems(): Promise<Inventory[]> {
    const collection = await this.getCollection()
    const docs = await collection
      .find({
        status: "low_stock",
        $expr: { $lte: ["$availableStock", "$reorderPoint"] },
      })
      .toArray()
    return docs.map(doc => this.toDomain(doc))
  }

  async getOutOfStockItems(): Promise<Inventory[]> {
    const collection = await this.getCollection()
    const docs = await collection
      .find({
        $or: [
          { status: "out_of_stock" },
          { availableStock: { $lte: 0 } },
        ],
      })
      .toArray()
    return docs.map(doc => this.toDomain(doc))
  }

  async create(payload: InventoryPayload): Promise<Inventory> {
    const errors = validateInventory(payload)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`)
    }

    const client = await this.getClient()
    const id = await getNextId(client, this.collectionName)
    const collection = await this.getCollection()
    const now = new Date()
    const inventory = new Inventory(
      id,
      payload.productId!,
      payload.currentStock || 0,
      payload.reservedStock || 0,
      (payload.currentStock || 0) - (payload.reservedStock || 0),
      payload.reorderPoint || 10,
      payload.reorderQuantity || 50,
      payload.status || "in_stock",
      payload.movements || [],
      payload.lastRestockedAt,
      now,
      now
    )

    const doc = this.toDocument(inventory)
    await collection.insertOne(doc as any)

    return inventory
  }

  async update(payload: InventoryPayload): Promise<Inventory | null> {
    if (!payload.id) {
      throw new Error("ID is required for update")
    }

    const errors = validateInventory(payload)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`)
    }

    const collection = await this.getCollection()
    const existing = await this.getById(payload.id)
    if (!existing) return null

    const updated = {
      ...existing,
      ...payload,
      updatedAt: new Date(),
    }

    const doc = this.toDocument(updated as Inventory)
    await collection.updateOne({ _id: payload.id } as any, { $set: doc })

    return this.toDomain(doc)
  }

  async delete(id: number): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: id } as any)
    return result.deletedCount === 1
  }

  async addStockMovement(
    inventoryId: number,
    movement: Omit<StockMovement, "timestamp">
  ): Promise<Inventory | null> {
    const inventory = await this.getById(inventoryId)
    if (!inventory) return null

    const updated = addStockMovement(inventory, movement)
    const doc = this.toDocument(updated)

    const collection = await this.getCollection()
    await collection.updateOne({ _id: inventoryId } as any, { $set: doc })

    return updated
  }

  async reserveStock(inventoryId: number, quantity: number): Promise<boolean> {
    const inventory = await this.getById(inventoryId)
    if (!inventory) return false

    const success = reserveStock(inventory, quantity)
    if (!success) return false

    const doc = this.toDocument(inventory)
    const collection = await this.getCollection()
    await collection.updateOne({ _id: inventoryId } as any, { $set: doc })

    return true
  }

  async releaseStock(inventoryId: number, quantity: number): Promise<boolean> {
    const inventory = await this.getById(inventoryId)
    if (!inventory) return false

    releaseReservedStock(inventory, quantity)

    const doc = this.toDocument(inventory)
    const collection = await this.getCollection()
    await collection.updateOne({ _id: inventoryId } as any, { $set: doc })

    return true
  }

  protected toDomain(doc: any): Inventory {
    return new Inventory(
      this.convertId(doc._id),
      doc.productId,
      doc.currentStock,
      doc.reservedStock,
      doc.availableStock,
      doc.reorderPoint,
      doc.reorderQuantity,
      doc.status,
      doc.movements || [],
      doc.lastRestockedAt ? new Date(doc.lastRestockedAt) : undefined,
      new Date(doc.createdAt),
      new Date(doc.updatedAt)
    )
  }

  protected toDocument(domain: Inventory): Record<string, unknown> {
    return {
      _id: domain.id,
      productId: domain.productId,
      currentStock: domain.currentStock,
      reservedStock: domain.reservedStock,
      availableStock: domain.availableStock,
      reorderPoint: domain.reorderPoint,
      reorderQuantity: domain.reorderQuantity,
      status: domain.status,
      movements: domain.movements,
      lastRestockedAt: domain.lastRestockedAt,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    }
  }
}
