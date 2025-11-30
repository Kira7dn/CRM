import type { SocialAuth, SocialPlatform } from "@/core/domain/social/social-auth"
import { calculateExpiresAt } from "@/core/domain/social/social-auth"
import type {
  SocialAuthService,
  SocialAuthPayload,
  RefreshTokenPayload,
} from "@/core/application/interfaces/social/social-auth-service"
import { ObjectId } from "mongodb"
import { BaseRepository } from "@/infrastructure/db/base-repository"

export class SocialAuthRepository
  extends BaseRepository<SocialAuth, ObjectId>
  implements SocialAuthService
{
  protected collectionName = "social_auth"

  // Get social auth by ID
  async getById(id: ObjectId): Promise<SocialAuth | null> {
    const collection = await this.getCollection()

    const doc = await collection.findOne({ _id: id })
    return doc ? this.toDomain(doc) : null
  }

  // Get social auth by user and platform
  async getByUserAndPlatform(
    userId: ObjectId,
    platform: SocialPlatform
  ): Promise<SocialAuth | null> {
    const collection = await this.getCollection()

    const doc = await collection.findOne({ userId, platform })
    return doc ? this.toDomain(doc) : null
  }

  // Get social auth by channel ID (openId) and platform
  async getByChannelAndPlatform(
    channelId: string,
    platform: SocialPlatform
  ): Promise<SocialAuth | null> {
    const collection = await this.getCollection()

    const doc = await collection.findOne({ openId: channelId, platform })
    return doc ? this.toDomain(doc) : null
  }

  // Create new social auth
  async create(payload: SocialAuthPayload): Promise<SocialAuth> {
    const collection = await this.getCollection()

    const now = new Date()
    const doc = this.toDocument({
      ...payload,
      createdAt: now,
      updatedAt: now,
    })
    await collection.insertOne(doc)
    return this.toDomain(doc)
  }

  // Update social auth
  async update(
    payload: SocialAuthPayload & { id: ObjectId }
  ): Promise<SocialAuth | null> {
    if (!payload.id) throw new Error("Social auth ID is required for update")

    const collection = await this.getCollection()
    const now = new Date()
    const { id, ...updateFields } = payload
    const updateData: Partial<SocialAuth> = {
      ...updateFields,
      updatedAt: now,
    }

    const result = await collection.findOneAndUpdate(
      { _id: id },
      {
        $set: updateData,
        // Set createdAt only if it doesn't exist (migration for old records)
        $setOnInsert: { createdAt: now }
      },
      { returnDocument: "after" }
    )

    // If the record exists but doesn't have createdAt, set it now
    if (result && !result.createdAt) {
      await collection.updateOne(
        { _id: id },
        { $set: { createdAt: now } }
      )
      result.createdAt = now
    }

    // MongoDB 6.x returns the document directly, not wrapped in .value
    return result ? this.toDomain(result) : null
  }

  // Delete social auth by ID
  async delete(id: ObjectId): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.deleteOne({ _id: id })
    return result.deletedCount ? result.deletedCount > 0 : false
  }

  // Delete social auth by user and platform (for disconnect feature)
  async deleteByUserAndPlatform(
    userId: ObjectId,
    platform: SocialPlatform
  ): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.deleteOne({ userId, platform })
    return result.deletedCount ? result.deletedCount > 0 : false
  }

  // Refresh access token
  async refreshToken(
    payload: RefreshTokenPayload
  ): Promise<SocialAuth | null> {
    const collection = await this.getCollection()

    const now = new Date()
    const expiresAt = calculateExpiresAt(payload.expiresInSeconds)

    // Debug logging
    console.log("RefreshToken Debug:", {
      platform: payload.platform,
      expiresInSeconds: payload.expiresInSeconds,
      now: now.toISOString(),
      calculatedExpiresAt: expiresAt.toISOString(),
      daysFromNow: Math.floor(payload.expiresInSeconds / 86400),
    })

    // Debug: Check if document exists before update
    const existingDoc = await collection.findOne({
      userId: payload.userId,
      platform: payload.platform,
    })

    if (!existingDoc) {
      console.error("RefreshToken: Document not found for query:", {
        userId: payload.userId,
        platform: payload.platform,
      })
      return null
    }

    console.log("Existing expiry:", existingDoc.expiresAt)

    const result = await collection.findOneAndUpdate(
      { userId: payload.userId, platform: payload.platform },
      {
        $set: {
          accessToken: payload.newAccessToken,
          refreshToken: payload.newRefreshToken,
          expiresAt,
          updatedAt: now,
        },
      },
      { returnDocument: "after" }
    )

    console.log("Updated expiry:", result?.expiresAt)

    // If the record exists but doesn't have createdAt, set it now (migration for old records)
    if (result && !result.createdAt) {
      await collection.updateOne(
        { userId: payload.userId, platform: payload.platform },
        { $set: { createdAt: now } }
      )
      result.createdAt = now
    }

    // MongoDB 6.x returns the document directly, not wrapped in .value
    return result ? this.toDomain(result) : null
  }

  // Get all social auth records for a user
  async getAllByUser(userId: ObjectId): Promise<SocialAuth[]> {
    const collection = await this.getCollection()

    const docs = await collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()

    return docs.map((doc) => this.toDomain(doc))
  }

  // Get all social auth records for a platform
  async getAllByPlatform(platform: SocialPlatform): Promise<SocialAuth[]> {
    const collection = await this.getCollection()

    const docs = await collection
      .find({ platform })
      .sort({ createdAt: -1 })
      .toArray()

    return docs.map((doc) => this.toDomain(doc))
  }
}
