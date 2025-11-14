import type { Product, SizeOption } from "@/core/domain/product";
import type { ProductService, FilterProductsParams, ProductPayload } from "@/core/application/interfaces/product-service";
import clientPromise from "@/infrastructure/db/mongo";

/**
 * MongoDB document - uses Product type with _id mapping
 */
type ProductDocument = Omit<Product, 'id'> & { _id: number };

const normalizeSizes = (product: ProductDocument): SizeOption[] | undefined => {
  if (!product.sizes || product.sizes.length === 0) return undefined;
  return product.sizes
    .map((s) => {
      if (typeof s === "string") {
        return {
          label: s,
          price: product.price,
          originalPrice: product.originalPrice,
        };
      }
      const label = s.label ?? "";
      if (!label) return null;
      const price = typeof s.price === "number" ? s.price : product.price;
      const originalPrice = typeof s.originalPrice === "number" ? s.originalPrice : product.originalPrice;
      return { label, price, originalPrice };
    })
    .filter((s) => s !== null) as SizeOption[];
};

const getNextProductId = async (): Promise<number> => {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const lastProduct = await db.collection<ProductDocument>("products").findOne({}, { sort: { _id: -1 } });
  return lastProduct ? lastProduct._id + 1 : 1;
};

/**
 * Converts MongoDB document to domain Product entity
 */
function toProduct(doc: ProductDocument): Product {
  const { _id, ...productData } = doc;
  return {
    ...productData,
    id: _id, // Map _id to id
    sizes: normalizeSizes(doc), // Normalize sizes
  };
}

export const productRepository: ProductService & {
  getNextId(): Promise<number>;
} = {
  async getAll(): Promise<Product[]> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const docs = await db.collection<ProductDocument>("products").find({}).sort({ _id: 1 }).toArray();
    return docs.map(toProduct);
  },

  async getById(id: number): Promise<Product | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const doc = await db.collection<ProductDocument>("products").findOne({ _id: id });
    return doc ? toProduct(doc) : null;
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
    const docs = await db.collection<ProductDocument>("products").find(query).sort({ _id: 1 }).toArray();
    return docs.map(toProduct);
  },

  async create(payload: ProductPayload): Promise<Product> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const id = await getNextProductId();
    const now = new Date();
    const doc: ProductDocument = {
      _id: id,
      categoryId: payload.categoryId || 0,
      name: payload.name || "",
      price: payload.price || 0,
      originalPrice: payload.originalPrice,
      image: payload.image || "",
      detail: payload.detail || "",
      sizes: payload.sizes,
      colors: payload.colors,
      createdAt: now,
      updatedAt: now,
    };
    await db.collection<ProductDocument>("products").insertOne(doc);
    return toProduct(doc);
  },

  async update(payload: ProductPayload): Promise<Product | null> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // For updates, id must be provided
    if (!payload.id) {
      throw new Error("Product ID is required for updates");
    }

    const now = new Date();
    const { id, ...updateFields } = payload;

    const updateObj: Partial<ProductDocument> = {
      ...updateFields,
      updatedAt: now,
    };

    const result = await db.collection<ProductDocument>("products").findOneAndUpdate(
      { _id: payload.id },
      { $set: updateObj },
      { returnDocument: "after" }
    );

    return result ? toProduct(result) : null;
  },

  async delete(id: number): Promise<boolean> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const result = await db.collection<ProductDocument>("products").deleteOne({ _id: id });
    return result.deletedCount > 0;
  },

  getNextId: getNextProductId,
};
