import { CategoryRepository } from '@/infrastructure/repositories/catalog/category-repo';
import type { CategoryService } from '@/core/application/interfaces/catalog/category-service';
import { GetCategoriesUseCase } from '@/core/application/usecases/catalog/category/get-categories';
import { CreateCategoryUseCase } from '@/core/application/usecases/catalog/category/create-category';
import { GetCategoryByIdUseCase } from '@/core/application/usecases/catalog/category/get-category-by-id';
import { UpdateCategoryUseCase } from '@/core/application/usecases/catalog/category/update-category';
import { DeleteCategoryUseCase } from '@/core/application/usecases/catalog/category/delete-category';

// Create CategoryRepository instance
const createCategoryRepository = async (): Promise<CategoryService> => {
  return new CategoryRepository();
};

// Create use case instances
export const getCategoriesUseCase = async () => {
  const categoryService = await createCategoryRepository();
  return new GetCategoriesUseCase(categoryService);
};

export const createCategoryUseCase = async () => {
  const categoryService = await createCategoryRepository();
  return new CreateCategoryUseCase(categoryService);
};

export const getCategoryByIdUseCase = async () => {
  const categoryService = await createCategoryRepository();
  return new GetCategoryByIdUseCase(categoryService);
};

export const updateCategoryUseCase = async () => {
  const categoryService = await createCategoryRepository();
  return new UpdateCategoryUseCase(categoryService);
};

export const deleteCategoryUseCase = async () => {
  const categoryService = await createCategoryRepository();
  return new DeleteCategoryUseCase(categoryService);
};