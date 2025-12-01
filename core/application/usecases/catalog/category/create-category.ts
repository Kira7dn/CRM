import type { Category } from "@/core/domain/catalog/category"
import type { CategoryService, CategoryPayload } from "@/core/application/interfaces/catalog/category-service"

export interface CreateCategoryRequest extends CategoryPayload { }

export interface CreateCategoryResponse {
  category: Category
}

export class CreateCategoryUseCase {
  constructor(private categoryService: CategoryService) { }

  async execute(request: CreateCategoryRequest): Promise<CreateCategoryResponse> {
    const category = await this.categoryService.create(request)
    return { category }
  }
}
