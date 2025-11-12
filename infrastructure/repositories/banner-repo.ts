import type { Banner } from "@/core/domain/banner";
import type { BannerService } from "@/core/application/interfaces/banner-service";
import clientPromise from "@/infrastructure/db/mongo";
import { ObjectId } from "mongodb";

const getNextBannerId = async (): Promise<number> => {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const lastBanner = await db.collection("banners").findOne({}, { sort: { _id: -1 } });
  return lastBanner ? ((lastBanner._id as any) as number) + 1 : 1;
};

export const bannerRepository: BannerService & {
  getNextId(): Promise<number>;
} = {
  async getAll(): Promise<Banner[]> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const docs = await db.collection("banners").find({}).sort({ _id: 1 }).toArray();
    return docs.map((d: any) => ({
      id: (d._id as any) as number,
      url: d.url,
    }));
  },

  async getById(id: number): Promise<Banner | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const doc = await db.collection("banners").findOne({ _id: id as any });
    return doc ? { id: (doc._id as any) as number, url: doc.url } : null;
  },

  async create(banner: Omit<Banner, "id">): Promise<Banner> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const id = await getNextBannerId();
    await db.collection("banners").insertOne({
      _id: id,
      url: banner.url,
    } as any);
    return { id, url: banner.url };
  },

  async update(id: number, banner: Partial<Banner>): Promise<Banner | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const result = await db.collection("banners").updateOne({ _id: id as any }, { $set: banner });
    if (result.modifiedCount > 0) {
      const updated = await db.collection("banners").findOne({ _id: id as any });
      return updated ? { id: (updated._id as any) as number, url: updated.url } : null;
    }
    return null;
  },

  async delete(id: number): Promise<boolean> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const result = await db.collection("banners").deleteOne({ _id: id as any });
    return result.deletedCount > 0;
  },

  getNextId: getNextBannerId,
};
