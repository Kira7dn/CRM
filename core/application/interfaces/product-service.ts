import type { Product } from "@/core/domain/product";

export interface FilterProductsParams {
  categoryId?: number | string;
  search?: string;
}

export interface ProductService {
  getAll(): Promise<Product[]>;
  getById(id: number): Promise<Product | null>;
  filter(params: FilterProductsParams): Promise<Product[]>;
  create(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product>;
  update(id: number, product: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>): Promise<Product | null>;
  delete(id: number): Promise<boolean>;
}
