import type { Category } from "@/core/domain/category"
import type { CategoryService } from "@/core/application/interfaces/category-service"

export interface GetCategoriesResponse {
  categories: Category[]
}

export class GetCategoriesUseCase {
  constructor(private categoryService: CategoryService) {}

  async execute(): Promise<GetCategoriesResponse> {
    const categories = await this.categoryService.getAll()
    return { categories }
  }
}
