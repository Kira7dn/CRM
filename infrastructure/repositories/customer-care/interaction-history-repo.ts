import type {
  InteractionHistory,
  CustomerInteractionSummary,
  InteractionType,
  InteractionChannel,
} from "@/core/domain/customer-care/interaction-history";
import type {
  InteractionHistoryService,
  InteractionHistoryPayload,
  InteractionHistoryFilters,
} from "@/core/application/interfaces/interaction-history-service";
import { ObjectId } from "mongodb";
import { BaseRepository } from "@/infrastructure/db/base-repository";

interface InteractionHistoryDocument extends Omit<InteractionHistory, "id"> {
  _id: ObjectId;
}

export class InteractionHistoryRepository
  extends BaseRepository<InteractionHistory, string>
  implements InteractionHistoryService
{
  protected collectionName = "interaction_history";

  /**
   * Create new interaction
   */
  async create(
    payload: InteractionHistoryPayload
  ): Promise<InteractionHistory> {
    const collection = await this.getCollection();
    const doc = this.toDocument(payload as any) as Omit<
      InteractionHistoryDocument,
      "_id"
    >;

    const result = await collection.insertOne({
      ...doc,
      _id: new ObjectId(),
    } as InteractionHistoryDocument);

    const created = await collection.findOne({ _id: result.insertedId });
    if (!created) {
      throw new Error("Failed to create interaction");
    }
    return this.toDomain(created as any);
  }

  /**
   * Get all interactions with filters
   */
  async getAll(filters: InteractionHistoryFilters): Promise<InteractionHistory[]> {
    const collection = await this.getCollection();
    const query: any = {};

    // Apply filters
    if (filters.customerId) {
      query.customerId = filters.customerId;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.channel) {
      query.channel = filters.channel;
    }

    if (filters.direction) {
      query.direction = filters.direction;
    }

    if (filters.requiresFollowUp !== undefined) {
      query.requiresFollowUp = filters.requiresFollowUp;
      if (filters.requiresFollowUp) {
        query.followedUpAt = { $exists: false };
      }
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      query.occurredAt = {};
      if (filters.startDate) {
        query.occurredAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.occurredAt.$lte = filters.endDate;
      }
    }

    const docs = await collection
      .find(query)
      .sort({ occurredAt: -1 })
      .skip(filters.offset || 0)
      .limit(filters.limit || 50)
      .toArray();

    return docs.map((doc) => this.toDomain(doc as any));
  }

  /**
   * Get interaction by ID
   */
  async getById(id: string): Promise<InteractionHistory | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    return doc ? (this.toDomain(doc as any) as InteractionHistory) : null;
  }

  /**
   * Get interactions by customer
   */
  async getByCustomer(
    customerId: string,
    limit: number = 100
  ): Promise<InteractionHistory[]> {
    const collection = await this.getCollection();
    const docs = await collection
      .find({ customerId })
      .sort({ occurredAt: -1 })
      .limit(limit)
      .toArray();

    return docs.map((doc) => this.toDomain(doc as any));
  }

  /**
   * Get customer interaction summary
   */
  async getSummary(
    customerId: string
  ): Promise<CustomerInteractionSummary | null> {
    const collection = await this.getCollection();

    const interactions = await collection
      .find({ customerId })
      .sort({ occurredAt: -1 })
      .toArray();

    if (interactions.length === 0) {
      return null;
    }

    // Calculate summary statistics
    const byChannel: Record<InteractionChannel, number> = {} as any;
    const byType: Record<InteractionType, number> = {} as any;
    let totalSentiment = 0;
    let sentimentCount = 0;
    let requiresFollowUpCount = 0;

    interactions.forEach((interaction) => {
      // Count by channel
      byChannel[interaction.channel] = (byChannel[interaction.channel] || 0) + 1;

      // Count by type
      byType[interaction.type] = (byType[interaction.type] || 0) + 1;

      // Average sentiment
      if (interaction.metadata?.sentimentScore !== undefined) {
        totalSentiment += interaction.metadata.sentimentScore;
        sentimentCount++;
      }

      // Count follow-ups needed
      if (interaction.requiresFollowUp && !interaction.followedUpAt) {
        requiresFollowUpCount++;
      }
    });

    const latest = interactions[0];

    return {
      customerId,
      totalInteractions: interactions.length,
      lastInteractionAt: latest.occurredAt,
      lastInteractionType: latest.type,
      averageSentiment: sentimentCount > 0 ? totalSentiment / sentimentCount : 0,
      requiresFollowUp: requiresFollowUpCount,
      byChannel,
      byType,
    };
  }

  /**
   * Update interaction
   */
  async update(
    id: string,
    payload: Partial<InteractionHistoryPayload>
  ): Promise<InteractionHistory | null> {
    const collection = await this.getCollection();
    const doc = this.toDocument(payload as any);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...doc, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    return result ? (this.toDomain(result as any) as InteractionHistory) : null;
  }

  /**
   * Mark interaction as followed up
   */
  async markFollowedUp(id: string): Promise<InteractionHistory | null> {
    const collection = await this.getCollection();

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          followedUpAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result ? (this.toDomain(result as any) as InteractionHistory) : null;
  }
}
