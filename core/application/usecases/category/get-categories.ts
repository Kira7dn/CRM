import type { CategoryService } from "@/core/application/interfaces/category-service";

export interface GetCategoriesResponse {
  categories: { id: number; name: string; image: string; createdAt?: Date; updatedAt?: Date }[];
}

export class GetCategoriesUseCase {
  constructor(private categoryService: CategoryService) {}

  async execute(): Promise<GetCategoriesResponse> {
    const categories = await this.categoryService.getAll();
    return { categories };
  }
}
