import type { Product } from "@/core/domain/managements/product";

export interface ProductPayload extends Partial<Product> { }

export interface FilterProductsParams {
  categoryId?: number | string;
  search?: string;
}

export interface ProductService {
  getAll(): Promise<Product[]>;
  getById(id: number): Promise<Product | null>;
  filter(params: FilterProductsParams): Promise<Product[]>;
  create(payload: ProductPayload): Promise<Product>;
  update(payload: ProductPayload & { id: number }): Promise<Product | null>;
  delete(id: number): Promise<boolean>;
}
