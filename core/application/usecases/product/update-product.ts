import type { ProductService } from "@/core/application/interfaces/product-service";

export interface UpdateProductRequest {
  id: number;
  categoryId?: number;
  name?: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  detail?: string;
  sizes?: string[];
  colors?: string[];
}

export interface UpdateProductResponse {
  product: any | null; // specific type
}

export class UpdateProductUseCase {
  constructor(private productService: ProductService) {}

  async execute(request: UpdateProductRequest): Promise<UpdateProductResponse> {
    const { id, ...updateData } = request;
    const product = await this.productService.update(id, updateData as any);
    return { product };
  }
}
