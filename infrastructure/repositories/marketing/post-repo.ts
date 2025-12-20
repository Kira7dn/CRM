import { BaseRepository, type PaginationOptions, type PaginatedResult } from "@/infrastructure/db/base-repository";
import { Post } from "@/core/domain/marketing/post";
import type { PostRepo, PostPayload } from "@/core/application/interfaces/marketing/post-repo";
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

  async getById(id: string): Promise<Post | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ _id: new ObjectId(id) } as any);
    return doc ? this.toDomain(doc) : null;
  }

  async create(payload: PostPayload): Promise<Post> {

    const collection = await this.getCollection();
    const { insertedId } = await collection.insertOne(payload);

    return this.toDomain({
      _id: insertedId,
      ...payload
    });
  }

  async update(payload: PostPayload): Promise<Post | null> {
    if (!payload.id) throw new Error("Post ID is required for update");

    const now = new Date();
    const { id, ...updateFields } = payload;

    const updateObj: any = {
      ...updateFields,
      updatedAt: now
    };

    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) } as any,
      { $set: updateObj },
      { returnDocument: "after" }
    );

    return result && result.value ? this.toDomain(result.value) : null;
  }

  async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) } as any);
    return result.deletedCount > 0;
  }
}
