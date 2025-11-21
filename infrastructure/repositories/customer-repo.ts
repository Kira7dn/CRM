import { BaseRepository } from "@/infrastructure/db/base-repository"
import type { Customer } from "@/core/domain/managements/customer"
import type {
  CustomerService,
  CustomerPayload
} from "@/core/application/interfaces/customer-service"


export class CustomerRepository extends BaseRepository<Customer, string> implements CustomerService {
  protected collectionName = "customers"

  async getAll(): Promise<Customer[]> {
    const collection = await this.getCollection()
    const docs = await collection.find({})
      .sort({ createdAt: -1 })
      .toArray()
    return docs.map(doc => this.toDomain(doc))
  }

  async getById(id: string): Promise<Customer | null> {
    const collection = await this.getCollection()
    const doc = await collection.findOne({ _id: id } as any)
    return doc ? this.toDomain(doc) : null
  }

  async create(payload: CustomerPayload): Promise<Customer> {
    if (!payload.id) {
      throw new Error("Customer ID is required for creation")
    }

    const now = new Date()

    const doc = this.toDocument({
      ...payload,
      createdAt: now,
      updatedAt: now,
    })
    const collection = await this.getCollection()
    await collection.insertOne(doc)
    return this.toDomain(doc)
  }

  async update(payload: CustomerPayload): Promise<Customer | null> {
    if (!payload.id) {
      throw new Error("Customer ID is required for update")
    }

    const now = new Date()
    const { id, ...updateData } = payload

    const updateObj: Partial<CustomerPayload> = {
      ...updateData,
      updatedAt: now
    }

    const collection = await this.getCollection()
    const result = await collection.findOneAndUpdate(
      { _id: id } as any,
      { $set: updateObj },
      { returnDocument: 'after' }
    )

    return result && result.value ? this.toDomain(result.value) : null
  }

  async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: id } as any)
    return result.deletedCount > 0
  }

  async searchByName(name: string): Promise<Customer[]> {
    const collection = await this.getCollection()
    const docs = await collection.find({
      $or: [
        { name: { $regex: name, $options: 'i' } },
        { email: { $regex: name, $options: 'i' } },
        { phone: { $regex: name, $options: 'i' } }
      ]
    })
      .sort({ createdAt: -1 })
      .toArray()

    return docs.map(doc => this.toDomain(doc))
  }

}
