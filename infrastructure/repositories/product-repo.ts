import type { Product, SizeOption } from "@/core/domain/product";
import type { ProductService, FilterProductsParams } from "@/core/application/interfaces/product-service";
import clientPromise from "@/infrastructure/db/mongo";

const normalizeSizes = (product: any): SizeOption[] | undefined => {
  if (!product.sizes || product.sizes.length === 0) return undefined;
  return product.sizes
    .map((s: any) => {
      if (typeof s === "string") {
        return {
          label: s,
          price: product.price,
          originalPrice: product.originalPrice,
        } as SizeOption;
      }
      const label = s.label ?? "";
      if (!label) return null;
      const price = typeof s.price === "number" ? s.price : product.price;
      const originalPrice = typeof s.originalPrice === "number" ? s.originalPrice : product.originalPrice;
      return { label, price, originalPrice } as SizeOption;
    })
    .filter(Boolean) as SizeOption[];
};

const getNextProductId = async (): Promise<number> => {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const lastProduct = await db.collection("products").findOne({}, { sort: { _id: -1 } });
  return lastProduct ? ((lastProduct._id as any) as number) + 1 : 1;
};

export const productRepository: ProductService & {
  getNextId(): Promise<number>;
} = {
  async getAll(): Promise<Product[]> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const docs = await db.collection("products").find({}).sort({ _id: 1 }).toArray();
    return docs.map((d: any) => ({
      id: d._id,
      categoryId: d.categoryId,
      name: d.name,
      price: d.price,
      originalPrice: d.originalPrice,
      image: d.image,
      detail: d.detail,
      sizes: normalizeSizes(d),
      colors: d.colors,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
  },

  async getById(id: number): Promise<Product | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const doc = await db.collection("products").findOne({ _id: id as any });
    return doc ? {
      id: (doc._id as any) as number,
      categoryId: doc.categoryId,
      name: doc.name,
      price: doc.price,
      originalPrice: doc.originalPrice,
      image: doc.image,
      detail: doc.detail,
      sizes: normalizeSizes(doc),
      colors: doc.colors,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    } : null;
  },

  async filter(params: FilterProductsParams): Promise<Product[]> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const query: Record<string, unknown> = {};
    if (params.categoryId !== undefined) {
      const categoryIdNumber = Number(params.categoryId);
      if (!Number.isNaN(categoryIdNumber)) {
        query.categoryId = categoryIdNumber;
      }
    }
    if (params.search) {
      query.name = { $regex: params.search, $options: "i" };
    }
    const docs = await db.collection("products").find(query).sort({ _id: 1 }).toArray();
    return docs.map((d: any) => ({
      id: d._id,
      categoryId: d.categoryId,
      name: d.name,
      price: d.price,
      originalPrice: d.originalPrice,
      image: d.image,
      detail: d.detail,
      sizes: normalizeSizes(d),
      colors: d.colors,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
  },

  async create(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const id = await getNextProductId();
    const now = new Date();
    await db.collection("products").insertOne({
      _id: id,
      categoryId: product.categoryId,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      detail: product.detail,
      sizes: product.sizes,
      colors: product.colors,
      createdAt: now,
      updatedAt: now,
    } as any);
    return {
      id,
      categoryId: product.categoryId,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      detail: product.detail,
      sizes: product.sizes,
      colors: product.colors,
      createdAt: now,
      updatedAt: now,
    };
  },

  async update(id: number, product: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>): Promise<Product | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const updateObj: any = { ...product };
    updateObj.updatedAt = new Date();
    const result = await db.collection("products").updateOne({ _id: id as any }, { $set: updateObj });
    if (result.modifiedCount > 0) {
      const updated = await db.collection("products").findOne({ _id: id as any });
      return updated ? {
        id: (updated._id as any) as number,
        categoryId: updated.categoryId,
        name: updated.name,
        price: updated.price,
        originalPrice: updated.originalPrice,
        image: updated.image,
        detail: updated.detail,
        sizes: normalizeSizes(updated),
        colors: updated.colors,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      } : null;
    }
    return null;
  },

  async delete(id: number): Promise<boolean> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const result = await db.collection("products").deleteOne({ _id: id as any });
    return result.deletedCount > 0;
  },

  getNextId: getNextProductId,
};
