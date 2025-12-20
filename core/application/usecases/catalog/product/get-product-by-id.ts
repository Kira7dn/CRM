import type { ProductService } from "@/core/application/interfaces/catalog/product-service";
import type { Product } from "@/core/domain/catalog/product";

export interface GetProductByIdRequest {
  id: string;
}

export interface GetProductByIdResponse {
  product: Product | null;
}

export class GetProductByIdUseCase {
  constructor(private productService: ProductService) { }

  async execute(request: GetProductByIdRequest): Promise<GetProductByIdResponse> {
    const product = await this.productService.getById(request.id);
    return { product };
  }
}
