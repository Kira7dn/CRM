import { BaseRepository } from "@/infrastructure/db/base-repository"
import { Resource } from "@/core/domain/marketing/resource"
import type { ResourceService, ResourcePayload } from "@/core/application/interfaces/marketing/resource-service"
import { ObjectId } from "mongodb"

/**
 * Resource Repository
 * Implements ResourceService for MongoDB data access
 */
export class ResourceRepository extends BaseRepository<Resource, string> implements ResourceService {
  protected collectionName = "resources"

  /**
   * Get all resources for a specific user
   */
  async getAll(userId: string): Promise<Resource[]> {
    const collection = await this.getCollection()
    const docs = await collection.find({ userId }).sort({ uploadedAt: -1 }).toArray()
    return docs.map(doc => this.toDomain(doc))
  }

  /**
   * Get a resource by ID
   */
  async getById(id: string): Promise<Resource | null> {
    const collection = await this.getCollection()
    const doc = await collection.findOne({ _id: new ObjectId(id) } as any)
    return doc ? this.toDomain(doc) : null
  }

  /**
   * Create a new resource
   */
  async create(payload: ResourcePayload): Promise<Resource> {
    const now = new Date()
    const doc: any = {
      userId: payload.userId,
      name: payload.name,
      fileType: payload.fileType,
      s3Url: payload.s3Url,
      s3Key: payload.s3Key,
      size: payload.size,
      chunkCount: payload.chunkCount || 0,
      uploadedAt: now,
    }

    const collection = await this.getCollection()
    const { insertedId } = await collection.insertOne(doc)
    doc._id = insertedId
    return this.toDomain(doc)
  }

  /**
   * Delete a resource by ID
   */
  async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(id) } as any)
    return result.deletedCount > 0
  }

  /**
   * Convert MongoDB document to domain Resource
   */
  protected toDomain(doc: any): Resource {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      name: doc.name,
      fileType: doc.fileType,
      s3Url: doc.s3Url,
      s3Key: doc.s3Key,
      size: doc.size,
      chunkCount: doc.chunkCount,
      uploadedAt: doc.uploadedAt,
    }
  }
}
