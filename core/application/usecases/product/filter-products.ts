import type { ProductService } from "@/core/application/interfaces/product-service";

export interface FilterProductsRequest {
  categoryId?: number | string;
  search?: string;
}

export interface FilterProductsResponse {
  products: any[]; // or specific type
}

export class FilterProductsUseCase {
  constructor(private productService: ProductService) {}

  async execute(request: FilterProductsRequest): Promise<FilterProductsResponse> {
    const products = await this.productService.filter(request);
    return { products };
  }
}
