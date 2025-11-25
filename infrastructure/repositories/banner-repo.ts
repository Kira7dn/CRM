import { BaseRepository } from "@/infrastructure/db/base-repository";
import { Banner } from "@/core/domain/campaigns/banner";
import type { BannerService, BannerPayload } from "@/core/application/interfaces/banner-service";
import { getNextId } from "@/infrastructure/db/auto-increment";

export class BannerRepository extends BaseRepository<Banner, number> implements BannerService {
  protected collectionName = "banners";

  async getAll(): Promise<Banner[]> {
    const collection = await this.getCollection();
    const docs = await collection.find({}).sort({ _id: 1 }).toArray();
    return docs.map(doc => this.toDomain(doc));
  }

  async getById(id: number): Promise<Banner | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ _id: id } as any);
    return doc ? this.toDomain(doc) : null;
  }

  async create(payload: BannerPayload): Promise<Banner> {
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

  async update(payload: BannerPayload): Promise<Banner | null> {
    if (!payload.id) throw new Error("Banner ID is required for update");

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
