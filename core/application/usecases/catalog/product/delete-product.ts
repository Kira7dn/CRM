import type { ProductService } from "@/core/application/interfaces/catalog/product-service";

export interface DeleteProductRequest {
  id: string;
}

export interface DeleteProductResponse {
  success: boolean;
}

export class DeleteProductUseCase {
  constructor(private productService: ProductService) { }

  async execute(request: DeleteProductRequest): Promise<DeleteProductResponse> {
    const success = await this.productService.delete(request.id.toString());
    return { success };
  }
}
