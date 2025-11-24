import { BaseRepository } from "@/infrastructure/db/base-repository"
import { InventoryConfig, validateInventoryConfig } from "@/core/domain/managements/inventory"
import type { InventoryConfigService, InventoryConfigPayload } from "@/core/application/interfaces/inventory-config-service"
import { getNextId } from "@/infrastructure/db/auto-increment"

export class InventoryConfigRepository extends BaseRepository<InventoryConfig, number> implements InventoryConfigService {
  protected collectionName = "inventory_configs"

  async create(payload: InventoryConfigPayload): Promise<InventoryConfig> {
    const errors = validateInventoryConfig(payload)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`)
    }

    const client = await this.getClient()
    const id = await getNextId(client, this.collectionName)
    const collection = await this.getCollection()
    const now = new Date()

    const config = new InventoryConfig(
      id,
      payload.productId!,
      payload.reorderPoint || 0,
      payload.reorderQuantity || 0,
      now,
      now
    )

    const doc = this.toDocument(config)
    await collection.insertOne(doc as any)

    return config
  }

  async getAll(): Promise<InventoryConfig[]> {
    const collection = await this.getCollection()
    const docs = await collection.find({}).sort({ _id: 1 }).toArray()
    return docs.map(doc => this.toDomain(doc))
  }

  async getByProductId(productId: number): Promise<InventoryConfig | null> {
    const collection = await this.getCollection()
    const doc = await collection.findOne({ productId })
    return doc ? this.toDomain(doc) : null
  }

  async update(payload: InventoryConfigPayload): Promise<InventoryConfig | null> {
    if (!payload.id) {
      throw new Error("ID is required for update")
    }

    const errors = validateInventoryConfig(payload)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`)
    }

    const collection = await this.getCollection()
    const existing = await collection.findOne({ _id: payload.id } as any)
    if (!existing) return null

    const updateObj: any = {
      reorderPoint: payload.reorderPoint,
      reorderQuantity: payload.reorderQuantity,
      updatedAt: new Date(),
    }

    const result = await collection.findOneAndUpdate(
      { _id: payload.id } as any,
      { $set: updateObj },
      { returnDocument: "after" }
    )

    return result && result.value ? this.toDomain(result.value) : null
  }

  async delete(id: number): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: id } as any)
    return result.deletedCount === 1
  }

  protected toDomain(doc: any): InventoryConfig {
    return new InventoryConfig(
      this.convertId(doc._id),
      doc.productId,
      doc.reorderPoint,
      doc.reorderQuantity,
      new Date(doc.createdAt),
      new Date(doc.updatedAt)
    )
  }

  protected toDocument(domain: InventoryConfig): Record<string, unknown> {
    return {
      _id: domain.id,
      productId: domain.productId,
      reorderPoint: domain.reorderPoint,
      reorderQuantity: domain.reorderQuantity,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    }
  }
}
