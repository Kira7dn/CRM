import { BaseRepository } from "@/infrastructure/db/base-repository";
import { Category } from "@/core/domain/category";
import type { CategoryService, CategoryPayload } from "@/core/application/interfaces/category-service";
import { getNextId } from "@/infrastructure/db/auto-increment";

export class CategoryRepository extends BaseRepository<Category, number> implements CategoryService {
  protected collectionName = "categories";

  async getAll(): Promise<Category[]> {
    const collection = await this.getCollection();
    const docs = await collection.find({}).sort({ _id: 1 }).toArray();
    return docs.map(doc => this.toDomain(doc));
  }

  async getById(id: number): Promise<Category | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ _id: id } as any);
    return doc ? this.toDomain(doc) : null;
  }

  async create(payload: CategoryPayload): Promise<Category> {
    const client = await this.getClient();
    const id = await getNextId(client, this.collectionName);
    const now = new Date();

    const doc = this.toDocument({
      ...payload,
      id,
      createdAt: now,
      updatedAt: now
    });

    const collection = await this.getCollection();
    await collection.insertOne(doc);
    return this.toDomain(doc);
  }

  async update(payload: CategoryPayload): Promise<Category | null> {
    if (!payload.id) throw new Error("Category ID is required for update");

    const now = new Date();
    const { id, ...updateFields } = payload;

    const updateObj: any = {
      ...updateFields,
      updatedAt: now
    };

    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: id } as any,
      { $set: updateObj },
      { returnDocument: "after" }
    );

    return result && result.value ? this.toDomain(result.value) : null;
  }

  async delete(id: number): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: id } as any);
    return result.deletedCount > 0;
  }
}
