import { CategoryRepository } from '@/infrastructure/repositories/category-repo';
import type { CategoryService } from '@/core/application/interfaces/category-service';
import { GetCategoriesUseCase } from '@/core/application/usecases/category/get-categories';
import { CreateCategoryUseCase } from '@/core/application/usecases/category/create-category';
import { GetCategoryByIdUseCase } from '@/core/application/usecases/category/get-category-by-id';
import { UpdateCategoryUseCase } from '@/core/application/usecases/category/update-category';
import { DeleteCategoryUseCase } from '@/core/application/usecases/category/delete-category';

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