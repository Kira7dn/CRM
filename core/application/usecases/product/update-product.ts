import type { Product } from "@/core/domain/product"
import type { ProductService, ProductPayload } from "@/core/application/interfaces/product-service"

export interface UpdateProductRequest extends ProductPayload {}

export interface UpdateProductResponse {
  product: Product | null
}

export class UpdateProductUseCase {
  constructor(private productService: ProductService) {}

  async execute(request: UpdateProductRequest): Promise<UpdateProductResponse> {
    const product = await this.productService.update(request)
    return { product }
  }
}
