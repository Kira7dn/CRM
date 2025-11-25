import type {
  MessageTemplate,
  TemplateCategory,
  TemplatePlatform,
} from "@/core/domain/customers/message-template";
import type {
  MessageTemplateService,
  MessageTemplatePayload,
  MessageTemplateFilterOptions,
} from "@/core/application/interfaces/customer-care/message-template-service";
import { ObjectId } from "mongodb";
import { BaseRepository } from "@/infrastructure/db/base-repository";

interface MessageTemplateDocument extends Omit<MessageTemplate, "id"> {
  _id: ObjectId;
}

export class MessageTemplateRepository
  extends BaseRepository<MessageTemplate, string>
  implements MessageTemplateService {
  protected collectionName = "message_templates";

  /**
   * Get all templates with optional filtering
   */
  async getAll(
    options?: MessageTemplateFilterOptions
  ): Promise<MessageTemplate[]> {
    const collection = await this.getCollection();
    const filter: any = {};

    if (options?.category) {
      filter.category = options.category;
    }

    if (options?.platform) {
      filter.platform = { $in: [options.platform, "all"] };
    }

    if (options?.isActive !== undefined) {
      filter.isActive = options.isActive;
    }

    if (options?.search) {
      filter.$or = [
        { name: { $regex: options.search, $options: "i" } },
        { content: { $regex: options.search, $options: "i" } },
      ];
    }

    const docs = await collection.find(filter).sort({ updatedAt: -1 }).toArray();
    return docs.map((doc) => this.toDomain(doc as any));
  }

  /**
   * Get template by ID
   */
  async getById(id: string): Promise<MessageTemplate | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    return doc ? (this.toDomain(doc as any) as MessageTemplate) : null;
  }

  /**
   * Get templates by category
   */
  async getByCategory(category: TemplateCategory): Promise<MessageTemplate[]> {
    const collection = await this.getCollection();
    const docs = await collection
      .find({ category, isActive: true })
      .sort({ usageCount: -1 })
      .toArray();
    return docs.map((doc) => this.toDomain(doc));
  }

  /**
   * Get templates by platform
   */
  async getByPlatform(platform: TemplatePlatform): Promise<MessageTemplate[]> {
    const collection = await this.getCollection();
    const docs = await collection
      .find({
        platform: { $in: [platform, "all"] },
        isActive: true,
      })
      .sort({ usageCount: -1 })
      .toArray();
    return docs.map((doc) => this.toDomain(doc as any));
  }

  /**
   * Create new template
   */
  async create(payload: MessageTemplatePayload): Promise<MessageTemplate> {
    const collection = await this.getCollection();
    const doc = this.toDocument(payload as any) as Omit<MessageTemplateDocument, "_id">;

    const result = await collection.insertOne({
      ...doc,
      _id: new ObjectId(),
    } as MessageTemplateDocument);

    const created = await collection.findOne({ _id: result.insertedId });
    if (!created) {
      throw new Error("Failed to create template");
    }
    return this.toDomain(created as any);
  }

  /**
   * Update existing template
   */
  async update(payload: MessageTemplatePayload): Promise<MessageTemplate | null> {
    if (!payload.id) {
      throw new Error("Template ID is required for update");
    }
    const collection = await this.getCollection();
    const { id, ...updateData } = payload;
    const doc = this.toDocument(updateData as any);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: doc },
      { returnDocument: "after" }
    );
    return result ? (this.toDomain(result as any) as MessageTemplate) : null;
  }

  /**
   * Delete template
   */
  async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }

  /**
   * Increment usage count
   */
  async incrementUsage(id: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { usageCount: 1 },
        $set: { lastUsedAt: new Date() },
      }
    );
  }

  /**
   * Clone template
   */
  async clone(id: string, newName: string): Promise<MessageTemplate> {
    const original = await this.getById(id);
    if (!original) {
      throw new Error(`Template with ID ${id} not found`);
    }

    const now = new Date();
    const cloned: MessageTemplatePayload = {
      ...original,
      id: undefined, // Remove ID to create new
      name: newName,
      usageCount: 0,
      lastUsedAt: undefined,
      createdAt: now,
      updatedAt: now,
    };

    return this.create(cloned);
  }
}
