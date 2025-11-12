import type { ProductService } from "@/core/application/interfaces/product-service";

export interface GetProductByIdRequest {
  id: number;
}

export interface GetProductByIdResponse {
  product: any | null; // specific type
}

export class GetProductByIdUseCase {
  constructor(private productService: ProductService) {}

  async execute(request: GetProductByIdRequest): Promise<GetProductByIdResponse> {
    const product = await this.productService.getById(request.id);
    return { product };
  }
}
