import type { ProductService } from "@/core/application/interfaces/catalog/product-service";
import type { Product } from "@/core/domain/catalog/product";

export interface FilterProductsRequest {
  categoryId?: number | string;
  search?: string;
}

export interface FilterProductsResponse {
  products: Product[];
}

export class FilterProductsUseCase {
  constructor(private productService: ProductService) { }

  async execute(request: FilterProductsRequest): Promise<FilterProductsResponse> {
    const products = await this.productService.filter(request);
    return { products };
  }
}
