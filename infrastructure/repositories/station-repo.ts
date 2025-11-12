import type { Station } from "@/core/domain/station";
import type { StationService } from "@/core/application/interfaces/station-service";
import clientPromise from "@/infrastructure/db/mongo";

const getNextStationId = async (): Promise<number> => {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const lastStation = await db.collection("stations").findOne({}, { sort: { _id: -1 } });
  return lastStation ? ((lastStation._id as any) as number) + 1 : 1;
};

export const stationRepository: StationService & {
  getNextId(): Promise<number>;
} = {
  async getAll(): Promise<Station[]> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const docs = await db.collection("stations").find({}).sort({ _id: 1 }).toArray();
    return docs.map((d: any) => ({
      id: (d._id as any) as number,
      name: d.name,
      image: d.image,
      address: d.address,
      location: d.location,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
  },

  async getById(id: number): Promise<Station | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const doc = await db.collection("stations").findOne({ _id: id as any });
    return doc ? {
      id: (doc._id as any) as number,
      name: doc.name,
      image: doc.image,
      address: doc.address,
      location: doc.location,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    } : null;
  },

  async create(station: Omit<Station, "id" | "createdAt" | "updatedAt">): Promise<Station> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const id = await getNextStationId();
    const now = new Date();
    await db.collection("stations").insertOne({
      _id: id,
      name: station.name,
      image: station.image,
      address: station.address,
      location: station.location,
      createdAt: now,
      updatedAt: now,
    } as any);
    return {
      id,
      name: station.name,
      image: station.image,
      address: station.address,
      location: station.location,
      createdAt: now,
      updatedAt: now,
    };
  },

  async update(id: number, station: Partial<Omit<Station, "id" | "createdAt" | "updatedAt">>): Promise<Station | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const updateObj: any = { ...station };
    updateObj.updatedAt = new Date();
    const result = await db.collection("stations").updateOne({ _id: id as any }, { $set: updateObj });
    if (result.modifiedCount > 0) {
      const updated = await db.collection("stations").findOne({ _id: id as any });
      return updated ? {
        id: (updated._id as any) as number,
        name: updated.name,
        image: updated.image,
        address: updated.address,
        location: updated.location,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      } : null;
    }
    return null;
  },

  async delete(id: number): Promise<boolean> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const result = await db.collection("stations").deleteOne({ _id: id as any });
    return result.deletedCount > 0;
  },

  getNextId: getNextStationId,
};
