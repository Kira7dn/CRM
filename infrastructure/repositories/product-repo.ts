import { BaseRepository } from "@/infrastructure/db/base-repository";
import { Product, SizeOption } from "@/core/domain/managements/product";
import type { ProductService, ProductPayload, FilterProductsParams } from "@/core/application/interfaces/product-service";
import { getNextId } from "@/infrastructure/db/auto-increment";

const normalizeSizes = (product: any): SizeOption[] | undefined => {
  if (!product.sizes || product.sizes.length === 0) return undefined;
  return product.sizes
    .map((s: any) => {
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
    .filter((s: any) => s !== null) as SizeOption[];
};

export class ProductRepository extends BaseRepository<Product, number> implements ProductService {
  protected collectionName = "products";

  async getAll(): Promise<Product[]> {
    const collection = await this.getCollection();
    const docs = await collection.find({}).sort({ _id: 1 }).toArray();
    return docs.map(doc => this.toDomain(doc));
  }

  async getById(id: number): Promise<Product | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ _id: id } as any);
    return doc ? this.toDomain(doc) : null;
  }

  async filter(params: FilterProductsParams): Promise<Product[]> {
    const collection = await this.getCollection();
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

    const docs = await collection.find(query).sort({ _id: 1 }).toArray();
    return docs.map(doc => this.toDomain(doc));
  }

  async create(payload: ProductPayload): Promise<Product> {
    const client = await this.getClient();
    const id = await getNextId(client, this.collectionName);
    const now = new Date();

    const doc = this.toDocument({
      ...payload,
      id,
      categoryId: payload.categoryId || 0,
      name: payload.name || "",
      price: payload.price || 0,
      originalPrice: payload.originalPrice,
      image: payload.image || "",
      detail: payload.detail || "",
      sizes: payload.sizes,
      colors: payload.colors,
      createdAt: now,
      updatedAt: now
    });

    const collection = await this.getCollection();
    await collection.insertOne(doc);
    return this.toDomain(doc);
  }

  async update(payload: ProductPayload): Promise<Product | null> {
    if (!payload.id) throw new Error("Product ID is required for update");

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

  protected toDomain(doc: any): Product {
    const { _id, ...productData } = doc;
    return new Product(
      _id,
      productData.categoryId,
      productData.name,
      productData.price,
      productData.originalPrice,
      productData.cost,
      productData.image,
      productData.detail,
      normalizeSizes(doc),
      productData.colors,
      productData.createdAt,
      productData.updatedAt
    );
  }
}
