import { BaseRepository, type PaginationOptions, type PaginatedResult } from "@/infrastructure/db/base-repository";
import { Post } from "@/core/domain/marketing/post";
import type { PostRepo, PostPayload, DateRangeFilter } from "@/core/application/interfaces/marketing/post-repo";
import { ObjectId } from "mongodb";

export class PostRepository extends BaseRepository<Post, string> implements PostRepo {
  protected collectionName = "posts";

  async getAll(options: PaginationOptions = {}): Promise<Post[]> {
    const collection = await this.getCollection();
    const { page, limit, skip } = this.buildPaginationQuery(options);

    const docs = await collection
      .find({})
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return docs.map(doc => this.toDomain(doc));
  }

  async getAllPaginated(options: PaginationOptions = {}): Promise<PaginatedResult<Post>> {
    const collection = await this.getCollection();
    const { page, limit, skip } = this.buildPaginationQuery(options);

    const [docs, total] = await Promise.all([
      collection.find({}).sort({ _id: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments({})
    ]);

    return {
      data: docs.map(doc => this.toDomain(doc)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getByDateRange(filter: DateRangeFilter): Promise<Post[]> {
    const collection = await this.getCollection();

    // Query posts where scheduledAt falls within the date range
    // Use Date objects for comparison (MongoDB stores dates as Date objects)
    // If scheduledAt is null/missing, fall back to createdAt
    const docs = await collection
      .find({
        $or: [
          {
            scheduledAt: {
              $gte: filter.startDate,  // Compare Date with Date
              $lte: filter.endDate
            }
          },
          {
            scheduledAt: { $exists: false },
            createdAt: {
              $gte: filter.startDate,
              $lte: filter.endDate
            }
          }
        ]
      })
      .sort({ scheduledAt: -1, createdAt: -1 })
      .toArray();

    return docs.map(doc => this.toDomain(doc));
  }

  async getById(id: string): Promise<Post | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ _id: new ObjectId(id) } as any);
    return doc ? this.toDomain(doc) : null;
  }

  async create(payload: PostPayload): Promise<Post> {
    const now = new Date();
    const collection = await this.getCollection();

    // Ensure all date fields are Date objects (not strings)
    // This guarantees MongoDB stores them as ISODate for proper comparison
    const doc = {
      ...payload,
      createdAt: payload.createdAt ? new Date(payload.createdAt) : now,
      updatedAt: payload.updatedAt ? new Date(payload.updatedAt) : now,
      scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt) : undefined,
    };

    const { insertedId } = await collection.insertOne(doc);

    return this.toDomain({
      _id: insertedId,
      ...doc,
    });
  }

  async update(payload: PostPayload): Promise<Post | null> {
    if (!payload.id || payload.id.trim() === "") {
      throw new Error("Post ID is required for update and cannot be empty");
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(payload.id)) {
      throw new Error(`Invalid Post ID format: ${payload.id}. Must be a valid MongoDB ObjectId.`);
    }

    const now = new Date();
    const { id, ...updateFields } = payload;

    // Ensure all date fields are Date objects (not strings)
    const updateObj: any = {
      ...updateFields,
      updatedAt: payload.updatedAt ? new Date(payload.updatedAt) : now,
    };

    // Convert scheduledAt to Date if it exists
    if (updateObj.scheduledAt) {
      updateObj.scheduledAt = new Date(updateObj.scheduledAt);
    }

    // Convert createdAt to Date if it exists
    if (updateObj.createdAt) {
      updateObj.createdAt = new Date(updateObj.createdAt);
    }

    console.log("[PostRepo.update] Input:", { id, updateObj });

    try {
      const collection = await this.getCollection();
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) } as any,
        { $set: updateObj },
        { returnDocument: "after" }
      );

      console.log("[PostRepo.update] MongoDB result:", result);
      console.log("[PostRepo.update] MongoDB result type:", typeof result);
      console.log("[PostRepo.update] MongoDB result.value:", result?.value);

      if (!result) {
        console.warn(`[PostRepo.update] No document found with ID: ${id}`);
        return null;
      }

      // MongoDB driver returns the document directly when using findOneAndUpdate
      // with returnDocument: "after", not wrapped in a { value: ... } object
      if (result.value) {
        // If it has a .value property, use it (older MongoDB driver behavior)
        return this.toDomain(result.value);
      } else if (result._id) {
        // If it has _id, it's the document itself (current MongoDB driver behavior)
        return this.toDomain(result);
      }

      console.warn(`[PostRepo.update] Unexpected result structure from MongoDB`);
      return null;
    } catch (error) {
      console.error("[PostRepo.update] MongoDB error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown database error";
      throw new Error(`Failed to update post in database: ${errorMessage}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) } as any);
    return result.deletedCount > 0;
  }
}
