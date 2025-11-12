import type { Category } from "@/core/domain/category";
import type { CategoryService } from "@/core/application/interfaces/category-service";
import clientPromise from "@/infrastructure/db/mongo";

const getNextCategoryId = async (): Promise<number> => {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const lastCategory = await db.collection("categories").findOne({}, { sort: { _id: -1 } });
  return lastCategory ? ((lastCategory._id as any) as number) + 1 : 1;
};

export const categoryRepository: CategoryService & {
  getNextId(): Promise<number>;
} = {
  async getAll(): Promise<Category[]> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const docs = await db.collection("categories").find({}).sort({ _id: 1 }).toArray();
    return docs.map((d: any) => ({
      id: (d._id as any) as number,
      name: d.name,
      image: d.image,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
  },

  async getById(id: number): Promise<Category | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const doc = await db.collection("categories").findOne({ _id: id as any });
    return doc ? {
      id: (doc._id as any) as number,
      name: doc.name,
      image: doc.image,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    } : null;
  },

  async create(category: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<Category> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const id = await getNextCategoryId();
    const now = new Date();
    await db.collection("categories").insertOne({
      _id: id,
      name: category.name,
      image: category.image,
      createdAt: now,
      updatedAt: now,
    } as any);
    return { id, name: category.name, image: category.image, createdAt: now, updatedAt: now };
  },

  async update(id: number, category: Partial<Omit<Category, "id" | "createdAt" | "updatedAt">>): Promise<Category | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const updateObj: any = { ...category };
    updateObj.updatedAt = new Date();
    const result = await db.collection("categories").updateOne({ _id: id as any }, { $set: updateObj });
    if (result.modifiedCount > 0) {
      const updated = await db.collection("categories").findOne({ _id: id as any });
      return updated ? {
        id: (updated._id as any) as number,
        name: updated.name,
        image: updated.image,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      } : null;
    }
    return null;
  },

  async delete(id: number): Promise<boolean> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const result = await db.collection("categories").deleteOne({ _id: id as any });
    return result.deletedCount > 0;
  },

  getNextId: getNextCategoryId,
};
