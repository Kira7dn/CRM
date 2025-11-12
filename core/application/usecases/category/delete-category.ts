import type { CategoryService } from "@/core/application/interfaces/category-service";

export interface DeleteCategoryRequest {
  id: number;
}

export interface DeleteCategoryResponse {
  success: boolean;
}

export class DeleteCategoryUseCase {
  constructor(private categoryService: CategoryService) {}

  async execute(request: DeleteCategoryRequest): Promise<DeleteCategoryResponse> {
    const success = await this.categoryService.delete(request.id);
    return { success };
  }
}
