import { BaseRepository } from "@/infrastructure/db/base-repository";
import { Station, Location } from "@/core/domain/managements/station";
import type { StationService, StationPayload } from "@/core/application/interfaces/station-service";
import { getNextId } from "@/infrastructure/db/auto-increment";

export class StationRepository extends BaseRepository<Station, number> implements StationService {
  protected collectionName = "stations";

  async getAll(): Promise<Station[]> {
    const collection = await this.getCollection();
    const docs = await collection.find({}).sort({ _id: 1 }).toArray();
    return docs.map(doc => this.toDomain(doc));
  }

  async getById(id: number): Promise<Station | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ _id: id } as any);
    return doc ? this.toDomain(doc) : null;
  }

  async create(payload: StationPayload): Promise<Station> {
    const client = await this.getClient();
    const id = await getNextId(client, this.collectionName);
    const now = new Date();

    const doc = this.toDocument({
      ...payload,
      id,
      name: payload.name || "",
      image: payload.image,
      address: payload.address || "",
      location: payload.location || { lat: 0, lng: 0 },
      createdAt: now,
      updatedAt: now
    });

    const collection = await this.getCollection();
    await collection.insertOne(doc);
    return this.toDomain(doc);
  }

  async update(payload: StationPayload): Promise<Station | null> {
    if (!payload.id) throw new Error("Station ID is required for update");

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

  protected toDomain(doc: any): Station {
    const { _id, ...stationData } = doc;
    return new Station(
      _id,
      stationData.name,
      stationData.image,
      stationData.address,
      stationData.location,
      stationData.createdAt,
      stationData.updatedAt
    );
  }
}
