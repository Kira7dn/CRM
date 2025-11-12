import type { CategoryService } from "@/core/application/interfaces/category-service";

export interface UpdateCategoryRequest {
  id: number;
  name?: string;
  image?: string;
}

export interface UpdateCategoryResponse {
  category: { id: number; name: string; image: string; createdAt?: Date; updatedAt?: Date } | null;
}

export class UpdateCategoryUseCase {
  constructor(private categoryService: CategoryService) {}

  async execute(request: UpdateCategoryRequest): Promise<UpdateCategoryResponse> {
    const category = await this.categoryService.update(request.id, { name: request.name, image: request.image });
    return { category };
  }
}
