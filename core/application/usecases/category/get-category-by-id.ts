import type { Category } from "@/core/domain/managements/category"
import type { CategoryService } from "@/core/application/interfaces/category-service"

export interface GetCategoryByIdRequest {
  id: number
}

export interface GetCategoryByIdResponse {
  category: Category | null
}

export class GetCategoryByIdUseCase {
  constructor(private categoryService: CategoryService) { }

  async execute(request: GetCategoryByIdRequest): Promise<GetCategoryByIdResponse> {
    const category = await this.categoryService.getById(request.id)
    return { category }
  }
}
