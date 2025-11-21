import { BaseRepository } from "../db/base-repository"
import type { CampaignService, CampaignPayload } from "@/core/application/interfaces/campaign-service"
import type { Campaign, CampaignStatus } from "@/core/domain/managements/campaign"
import { getNextId } from "@/infrastructure/db/auto-increment"

export class CampaignRepository extends BaseRepository<Campaign, number> implements CampaignService {
  protected collectionName = "campaigns"

  async getAll(): Promise<Campaign[]> {
    const collection = await this.getCollection()
    const documents = await collection.find({}).sort({ _id: 1 }).toArray()
    return documents.map((doc) => this.toDomain(doc))
  }

  async getById(id: number): Promise<Campaign | null> {
    const collection = await this.getCollection()
    const document = await collection.findOne({ _id: id } as any)
    return document ? this.toDomain(document) : null
  }

  async getByStatus(status: CampaignStatus): Promise<Campaign[]> {
    const collection = await this.getCollection()
    const documents = await collection.find({ status }).toArray()
    return documents.map((doc) => this.toDomain(doc))
  }

  async create(payload: CampaignPayload): Promise<Campaign> {
    const client = await this.getClient()
    const id = await getNextId(client, this.collectionName)
    const now = new Date()

    const document = this.toDocument({
      ...payload,
      id,
      createdAt: now,
      updatedAt: now,
    } as Campaign)

    const collection = await this.getCollection()
    await collection.insertOne(document)
    return this.toDomain(document)
  }

  async update(payload: CampaignPayload): Promise<Campaign | null> {
    if (!payload.id) {
      throw new Error("Campaign ID is required for update")
    }

    const now = new Date()
    const { id, ...updateFields } = payload

    const updateObj: any = {
      ...updateFields,
      updatedAt: now,
    }

    const collection = await this.getCollection()
    const result = await collection.findOneAndUpdate(
      { _id: id } as any,
      { $set: updateObj },
      { returnDocument: "after" }
    )

    return result && result.value ? this.toDomain(result.value) : null
  }

  async delete(id: number): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: id } as any)
    return result.deletedCount > 0
  }
}

export const campaignRepository = new CampaignRepository()
