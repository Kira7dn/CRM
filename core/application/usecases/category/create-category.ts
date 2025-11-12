import type { CategoryService } from "@/core/application/interfaces/category-service";

export interface CreateCategoryRequest {
  id?: number;
  name: string;
  image?: string;
}

export interface CreateCategoryResponse {
  category: { id: number; name: string; image: string; createdAt?: Date; updatedAt?: Date };
}

export class CreateCategoryUseCase {
  constructor(private categoryService: CategoryService) {}

  async execute(request: CreateCategoryRequest): Promise<CreateCategoryResponse> {
    const category = await this.categoryService.create({ name: request.name, image: request.image || "" });
    return { category };
  }
}
