import type { Product } from "@/core/domain/managements/product"
import type { ProductService, ProductPayload } from "@/core/application/interfaces/product-service"

export interface CreateProductRequest extends ProductPayload { }

export interface CreateProductResponse {
  product: Product
}

export class CreateProductUseCase {
  constructor(private productService: ProductService) { }

  async execute(request: CreateProductRequest): Promise<CreateProductResponse> {
    const product = await this.productService.create(request)
    return { product }
  }
}
