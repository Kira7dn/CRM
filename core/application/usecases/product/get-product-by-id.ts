import type { ProductService } from "@/core/application/interfaces/product-service";
import type { Product } from "@/core/domain/managements/product";

export interface GetProductByIdRequest {
  id: number;
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
