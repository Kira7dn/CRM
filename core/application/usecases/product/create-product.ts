import type { ProductService } from "@/core/application/interfaces/product-service";

export interface CreateProductRequest {
  id?: number;
  categoryId: number;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  detail?: string;
  sizes?: string[];
  colors?: string[];
}

export interface CreateProductResponse {
  product: any; // specific type
}

export class CreateProductUseCase {
  constructor(private productService: ProductService) {}

  async execute(request: CreateProductRequest): Promise<CreateProductResponse> {
    const product = await this.productService.create(request as any);
    return { product };
  }
}
