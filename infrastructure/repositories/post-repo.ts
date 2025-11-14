import { BaseRepository } from "@/infrastructure/db/base-repository";
import { Post } from "@/core/domain/post";
import type { PostService, PostPayload } from "@/core/application/interfaces/post-service";
import { ObjectId } from "mongodb";

export class PostRepository extends BaseRepository<Post, string> implements PostService {
  protected collectionName = "posts";

  async getAll(): Promise<Post[]> {
    const collection = await this.getCollection();
    const docs = await collection.find({}).sort({ _id: -1 }).toArray();
    return docs.map(doc => this.toDomain(doc));
  }

  async getById(id: string): Promise<Post | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ _id: new ObjectId(id) } as any);
    return doc ? this.toDomain(doc) : null;
  }

  async create(payload: PostPayload): Promise<Post> {
    const now = new Date();
    const doc: any = {
      title: payload.title || "",
      body: payload.body,
      createdAt: now,
      updatedAt: now
    };

    const collection = await this.getCollection();
    const { insertedId } = await collection.insertOne(doc);

    doc._id = insertedId;
    return this.toDomain(doc);
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

  protected toDomain(doc: any): Post {
    const { _id, ...postData } = doc;
    return new Post(
      _id.toString(),
      postData.title,
      postData.body,
      postData.createdAt,
      postData.updatedAt
    );
  }
}
