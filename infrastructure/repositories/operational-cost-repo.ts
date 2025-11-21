import { BaseRepository } from "@/infrastructure/db/base-repository"
import { OperationalCost, CostCategory, validateOperationalCost } from "@/core/domain/managements/operational-cost"
import type { OperationalCostService, OperationalCostPayload } from "@/core/application/interfaces/operational-cost-service"
import { getNextId } from "@/infrastructure/db/auto-increment"

export class OperationalCostRepository extends BaseRepository<OperationalCost, number> implements OperationalCostService {
  protected collectionName = "operational_costs"

  async getAll(): Promise<OperationalCost[]> {
    const collection = await this.getCollection()
    const docs = await collection.find({}).sort({ date: -1 }).toArray()
    return docs.map(doc => this.toDomain(doc))
  }

  async getById(id: number): Promise<OperationalCost | null> {
    const collection = await this.getCollection()
    const doc = await collection.findOne({ _id: id } as any)
    return doc ? this.toDomain(doc) : null
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<OperationalCost[]> {
    const collection = await this.getCollection()
    const docs = await collection
      .find({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ date: -1 })
      .toArray()
    return docs.map(doc => this.toDomain(doc))
  }

  async getByCategory(category: CostCategory): Promise<OperationalCost[]> {
    const collection = await this.getCollection()
    const docs = await collection.find({ category }).sort({ date: -1 }).toArray()
    return docs.map(doc => this.toDomain(doc))
  }

  async getByOrderId(orderId: number): Promise<OperationalCost[]> {
    const collection = await this.getCollection()
    const docs = await collection.find({ orderId }).toArray()
    return docs.map(doc => this.toDomain(doc))
  }

  async create(payload: OperationalCostPayload): Promise<OperationalCost> {
    const errors = validateOperationalCost(payload)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`)
    }

    const client = await this.getClient()
    const id = await getNextId(client, this.collectionName)
    const collection = await this.getCollection()

    const now = new Date()
    const cost = new OperationalCost(
      id,
      payload.category!,
      payload.type!,
      payload.amount!,
      payload.description!,
      payload.date!,
      payload.orderId,
      payload.notes,
      now,
      now
    )

    const doc = this.toDocument(cost)
    await collection.insertOne(doc as any)

    return cost
  }

  async update(payload: OperationalCostPayload): Promise<OperationalCost | null> {
    if (!payload.id) {
      throw new Error("ID is required for update")
    }

    const errors = validateOperationalCost(payload)
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

    const doc = this.toDocument(updated as OperationalCost)
    await collection.updateOne({ _id: payload.id } as any, { $set: doc })

    return this.toDomain(doc)
  }

  async delete(id: number): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: id } as any)
    return result.deletedCount === 1
  }

  protected toDomain(doc: any): OperationalCost {
    return new OperationalCost(
      this.convertId(doc._id),
      doc.category,
      doc.type,
      doc.amount,
      doc.description,
      new Date(doc.date),
      doc.orderId,
      doc.notes,
      new Date(doc.createdAt),
      new Date(doc.updatedAt)
    )
  }

  protected toDocument(domain: OperationalCost): Record<string, unknown> {
    return {
      _id: domain.id,
      category: domain.category,
      type: domain.type,
      amount: domain.amount,
      description: domain.description,
      date: domain.date,
      orderId: domain.orderId,
      notes: domain.notes,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    }
  }
}
