import type { Banner } from "@/core/domain/banner";
import type { BannerService, BannerPayload } from "@/core/application/interfaces/banner-service";
import clientPromise from "@/infrastructure/db/mongo";

/**
 * MongoDB document - uses Banner type with _id mapping
 */
type BannerDocument = Omit<Banner, 'id'> & { _id: number };

const getNextBannerId = async (): Promise<number> => {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const lastBanner = await db.collection<BannerDocument>("banners").findOne({}, { sort: { _id: -1 } });
  return lastBanner ? lastBanner._id + 1 : 1;
};

export const bannerRepository: BannerService & {
  getNextId(): Promise<number>;
} = {
  async getAll(): Promise<Banner[]> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const docs = await db.collection<BannerDocument>("banners").find({}).sort({ _id: 1 }).toArray();
    return docs.map((d) => ({
      id: d._id,  // Map _id to id
      url: d.url,
    }));
  },

  async getById(id: number): Promise<Banner | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const doc = await db.collection<BannerDocument>("banners").findOne({ _id: id });
    return doc ? { id: doc._id, url: doc.url } : null;
  },

  async create(payload: BannerPayload): Promise<Banner> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const id = await getNextBannerId();
    const doc: BannerDocument = {
      _id: id,
      url: payload.url || "", // Provide default empty string
    };
    await db.collection<BannerDocument>("banners").insertOne(doc);
    return { id, url: payload.url || "" };
  },

  async update(payload: BannerPayload): Promise<Banner | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // For updates, id must be provided to know which banner to update
    if (!payload.id) {
      throw new Error("Banner ID is required for updates");
    }

    const updateObj: Partial<BannerDocument> = {};
    if (payload.url !== undefined) updateObj.url = payload.url;

    const result = await db.collection<BannerDocument>("banners").findOneAndUpdate(
      { _id: payload.id }, // Find by _id
      { $set: updateObj },
      { returnDocument: "after" }
    );

    if (result) {
      return { id: result._id, url: result.url };
    }
    return null;
  },

  async delete(id: number): Promise<boolean> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const result = await db.collection<BannerDocument>("banners").deleteOne({ _id: id });
    return result.deletedCount > 0;
  },

  getNextId: getNextBannerId,
};
