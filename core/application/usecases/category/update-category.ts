import type { Category } from "@/core/domain/category"
import type { CategoryService, CategoryPayload } from "@/core/application/interfaces/category-service"

export interface UpdateCategoryRequest extends CategoryPayload {
  id: number; // Override to require id
}

export interface UpdateCategoryResponse {
  category: Category | null
}

export class UpdateCategoryUseCase {
  constructor(private categoryService: CategoryService) {}

  async execute(request: UpdateCategoryRequest): Promise<UpdateCategoryResponse> {
    const category = await this.categoryService.update(request)
    return { category }
  }
}
