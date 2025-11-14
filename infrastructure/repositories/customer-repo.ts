import type { Customer } from "@/core/domain/customer"
import type {
  CustomerService,
  CustomerPayload
} from "@/core/application/interfaces/customer-service"
import clientPromise from "@/infrastructure/db/mongo"

/**
 * MongoDB document - uses Customer type with external ID as _id
 */
type CustomerDocument = Omit<Customer, 'id'> & { _id: string };

/**
 * Converts MongoDB document to domain Customer entity
 */
function toCustomer(doc: CustomerDocument): Customer {
  const { _id, ...customerData } = doc
  return {
    ...customerData,
    id: _id, // External ID is stored in _id
  }
}

export const customerRepository: CustomerService = {
  async getAll(): Promise<Customer[]> {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)
    const docs = await db.collection<CustomerDocument>("customers")
      .find({})
      .sort({ createdAt: -1 })
      .toArray()
    return docs.map(toCustomer)
  },

  async getById(id: string): Promise<Customer | null> {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    const doc = await db.collection<CustomerDocument>("customers")
      .findOne({ _id: id }) // Find by external ID as _id

    return doc ? toCustomer(doc) : null
  },

  async create(payload: CustomerPayload): Promise<Customer> {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)
    const now = new Date()

    // For CRM, id should be provided (external platform ID)
    if (!payload.id) {
      throw new Error("Customer ID is required for creation")
    }

    const doc: CustomerDocument = {
      _id: payload.id, // Use external ID as MongoDB _id
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
      avatar: payload.avatar || "",
      foundation: payload.foundation || "", // Provide default empty string
      createdAt: now,
      updatedAt: now,
    }

    await db.collection<CustomerDocument>("customers").insertOne(doc)

    return toCustomer(doc)
  },

  async update(payload: CustomerPayload): Promise<Customer | null> {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    // For updates, id must be provided to know which customer to update
    if (!payload.id) {
      throw new Error("Customer ID is required for updates")
    }

    const now = new Date()
    const { id, ...updateFields } = payload // id is external ID

    const update: Partial<Omit<CustomerDocument, '_id'>> = {
      ...updateFields,
      updatedAt: now,
    }

    const doc = await db.collection<CustomerDocument>("customers").findOneAndUpdate(
      { _id: payload.id }, // Find by external ID as _id
      { $set: update },
      { returnDocument: "after" }
    )

    return doc ? toCustomer(doc) : null
  },

  async delete(id: string): Promise<boolean> {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    const result = await db.collection<CustomerDocument>("customers")
      .deleteOne({ _id: id }) // Delete by external ID as _id

    return result.deletedCount > 0
  },

  async searchByName(name: string): Promise<Customer[]> {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    const docs = await db.collection<CustomerDocument>("customers")
      .find({
        name: {
          $exists: true,
          $regex: name,
          $options: 'i'
        }
      })
      .sort({ createdAt: -1 })
      .toArray()

    return docs.map(toCustomer)
  },

}
