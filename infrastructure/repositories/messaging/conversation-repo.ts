import { BaseRepository } from "@/infrastructure/db/base-repository";
import type { Document } from "mongodb";
import type { Conversation } from "@/core/domain/messaging/conversation";
import type {
  ConversationService,
  ConversationPayload,
} from "@/core/application/interfaces/messaging/conversation-service";
import { ObjectId as MongoObjectId } from "mongodb";

/**
 * Conversation Repository
 * Implements ConversationService interface for MongoDB persistence
 */
export class ConversationRepository
  extends BaseRepository<Conversation, string>
  implements ConversationService {
  protected collectionName = "conversations";

  /**
   * Convert MongoDB document to Conversation domain entity
   */
  protected toDomain(doc: Document): Conversation {
    return {
      id: doc._id.toString(),
      // NEW fields
      channelId: doc.channelId,
      contactId: doc.contactId,
      // Legacy field
      customerId: doc.customerId,
      platform: doc.platform,
      platformConversationId: doc.platformConversationId,
      status: doc.status,
      priority: doc.priority,
      // NEW agent fields
      agentId: doc.agentId,
      assignedTo: doc.assignedTo,
      assignedGroup: doc.assignedGroup,
      // NEW chat management
      unreadCount: doc.unreadCount,
      isBotActive: doc.isBotActive,
      tags: doc.tags,
      metadata: doc.metadata,
      // NEW timestamps
      lastIncomingMessageAt: doc.lastIncomingMessageAt,
      lastOutgoingMessageAt: doc.lastOutgoingMessageAt,
      lastMessageAt: doc.lastMessageAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      closedAt: doc.closedAt,
      resolvedBy: doc.resolvedBy,
    };
  }

  /**
   * Convert Conversation entity to MongoDB document
   */
  protected toDocument(entity: Partial<Conversation>): Document {
    const doc: any = {
      // NEW fields
      channelId: entity.channelId,
      contactId: entity.contactId,
      // Legacy
      customerId: entity.customerId,
      platform: entity.platform,
      platformConversationId: entity.platformConversationId,
      status: entity.status ?? "open",
      priority: entity.priority,
      // NEW agent fields
      agentId: entity.agentId,
      assignedTo: entity.assignedTo,
      assignedGroup: entity.assignedGroup,
      // NEW chat management
      unreadCount: entity.unreadCount,
      isBotActive: entity.isBotActive,
      tags: entity.tags,
      metadata: entity.metadata,
      // NEW timestamps
      lastIncomingMessageAt: entity.lastIncomingMessageAt,
      lastOutgoingMessageAt: entity.lastOutgoingMessageAt,
      lastMessageAt: entity.lastMessageAt,
      createdAt: entity.createdAt ?? new Date(),
      updatedAt: entity.updatedAt,
      closedAt: entity.closedAt,
      resolvedBy: entity.resolvedBy,
    };

    if (entity.id) {
      doc._id = new MongoObjectId(entity.id);
    }

    // Remove undefined fields
    Object.keys(doc).forEach(key => doc[key] === undefined && delete doc[key]);

    return doc;
  }

  async getAll(): Promise<Conversation[]> {
    const collection = await this.getCollection();
    const docs = await collection
      .find({})
      .sort({ lastMessageAt: -1 })
      .toArray();
    return docs.map((doc) => this.toDomain(doc));
  }

  async getById(id: string): Promise<Conversation | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ _id: new MongoObjectId(id) });
    return doc ? this.toDomain(doc) : null;
  }

  async create(payload: ConversationPayload): Promise<Conversation> {
    const now = new Date();
    const doc = this.toDocument({
      ...payload,
      createdAt: payload.createdAt || now,
      updatedAt: now,
    });

    const collection = await this.getCollection();
    const result = await collection.insertOne(doc);

    return this.toDomain({
      ...doc,
      _id: result.insertedId,
    });
  }

  async update(payload: ConversationPayload): Promise<Conversation | null> {
    if (!payload.id) {
      throw new Error("Conversation ID is required for update");
    }

    const now = new Date();
    const { id, ...updateData } = payload;

    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new MongoObjectId(id) },
      { $set: { ...updateData, updatedAt: now } },
      { returnDocument: "after" }
    );

    return result ? this.toDomain(result) : null;
  }

  async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new MongoObjectId(id) });
    return result.deletedCount > 0;
  }

  async findActiveByCustomer(customerId: string): Promise<Conversation[]> {
    const collection = await this.getCollection();
    const docs = await collection
      .find({ customerId, status: { $ne: "closed" } })
      .sort({ lastMessageAt: -1 })
      .toArray();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByCustomerAndPlatform(
    customerId: string,
    platform: string
  ): Promise<Conversation | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({
      customerId,
      platform,
      status: { $ne: "closed" },
    });
    return doc ? this.toDomain(doc) : null;
  }

  async assignToAgent(conversationId: string, agentId: number): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: new MongoObjectId(conversationId) },
      { $set: { assignedTo: agentId, updatedAt: new Date() } }
    );
  }

  async updateLastMessageTime(
    conversationId: string,
    time: Date
  ): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: new MongoObjectId(conversationId) },
      { $set: { lastMessageAt: time, updatedAt: new Date() } }
    );
  }

  async updateStatus(conversationId: string, status: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: new MongoObjectId(conversationId) },
      { $set: { status, updatedAt: new Date() } }
    );
  }

  /**
   * NEW: Find open conversation by channelId and senderPlatformId
   * This is the improved method for multi-channel support
   */
  async findOpenByChannelAndCustomer(
    channelId: string,
    senderPlatformId: string
  ): Promise<Conversation | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({
      channelId,
      customerId: senderPlatformId, // Using customerId to store senderPlatformId
      status: { $ne: "closed" },
    });
    return doc ? this.toDomain(doc) : null;
  }
}
