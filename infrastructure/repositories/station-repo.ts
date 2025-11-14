import type { Station, Location } from "@/core/domain/station";
import type { StationService, StationPayload } from "@/core/application/interfaces/station-service";
import clientPromise from "@/infrastructure/db/mongo";

/**
 * MongoDB document - uses Station type with _id mapping
 */
type StationDocument = Omit<Station, 'id'> & { _id: number };

const getNextStationId = async (): Promise<number> => {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const lastStation = await db.collection<StationDocument>("stations").findOne({}, { sort: { _id: -1 } });
  return lastStation ? lastStation._id + 1 : 1;
};

/**
 * Converts MongoDB document to domain Station entity
 */
function toStation(doc: StationDocument): Station {
  const { _id, ...stationData } = doc;
  return {
    ...stationData,
    id: _id, // Map _id to id
  };
}

export const stationRepository: StationService & {
  getNextId(): Promise<number>;
} = {
  async getAll(): Promise<Station[]> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const docs = await db.collection<StationDocument>("stations").find({}).sort({ _id: 1 }).toArray();
    return docs.map(toStation);
  },

  async getById(id: number): Promise<Station | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const doc = await db.collection<StationDocument>("stations").findOne({ _id: id });
    return doc ? toStation(doc) : null;
  },

  async create(payload: StationPayload): Promise<Station> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const id = await getNextStationId();
    const now = new Date();
    const doc: StationDocument = {
      _id: id,
      name: payload.name || "",
      image: payload.image,
      address: payload.address || "",
      location: payload.location || { lat: 0, lng: 0 },
      createdAt: now,
      updatedAt: now,
    };
    await db.collection<StationDocument>("stations").insertOne(doc);
    return toStation(doc);
  },

  async update(payload: StationPayload): Promise<Station | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // For updates, id must be provided
    if (!payload.id) {
      throw new Error("Station ID is required for updates");
    }

    const now = new Date();
    const { id, ...updateFields } = payload;

    const updateObj: Partial<StationDocument> = {
      ...updateFields,
      updatedAt: now,
    };

    const result = await db.collection<StationDocument>("stations").findOneAndUpdate(
      { _id: payload.id },
      { $set: updateObj },
      { returnDocument: "after" }
    );

    return result ? toStation(result) : null;
  },

  async delete(id: number): Promise<boolean> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const result = await db.collection<StationDocument>("stations").deleteOne({ _id: id });
    return result.deletedCount > 0;
  },

  getNextId: getNextStationId,
};
