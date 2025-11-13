import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCategoryUseCase } from '../create-category';
import { UpdateCategoryUseCase } from '../update-category';
import { GetCategoryByIdUseCase } from '../get-category-by-id';
import { GetCategoriesUseCase } from '../get-categories';
import { DeleteCategoryUseCase } from '../delete-category';
import type { CategoryService } from '@/core/application/interfaces/category-service';
import type { Category } from '@/core/domain/category';

describe('Category Use Cases', () => {
  let mockCategoryService: CategoryService;

  beforeEach(() => {
    mockCategoryService = {
      create: vi.fn(),
      update: vi.fn(),
      getById: vi.fn(),
      getAll: vi.fn(),
      delete: vi.fn(),
    };
  });

  describe('CreateCategoryUseCase', () => {
    it('should create a category with name and image', async () => {
      const mockCategory: Category = {
        id: 1,
        name: 'Seafood',
        image: 'https://example.com/seafood.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockCategoryService.create).mockResolvedValue(mockCategory);

      const useCase = new CreateCategoryUseCase(mockCategoryService);
      const result = await useCase.execute({
        name: 'Seafood',
        image: 'https://example.com/seafood.jpg',
      });

      expect(mockCategoryService.create).toHaveBeenCalledWith({
        name: 'Seafood',
        image: 'https://example.com/seafood.jpg',
      });
      expect(result.category).toEqual(mockCategory);
    });

    it('should create a category with default empty image when not provided', async () => {
      const mockCategory: Category = {
        id: 2,
        name: 'Dried Seafood',
        image: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockCategoryService.create).mockResolvedValue(mockCategory);

      const useCase = new CreateCategoryUseCase(mockCategoryService);
      const result = await useCase.execute({ name: 'Dried Seafood' });

      expect(mockCategoryService.create).toHaveBeenCalledWith({
        name: 'Dried Seafood',
        image: '',
      });
      expect(result.category.image).toBe('');
    });
  });

  describe('UpdateCategoryUseCase', () => {
    it('should update an existing category', async () => {
      const mockCategory: Category = {
        id: 1,
        name: 'Fresh Seafood',
        image: 'https://example.com/fresh-seafood.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockCategoryService.update).mockResolvedValue(mockCategory);

      const useCase = new UpdateCategoryUseCase(mockCategoryService);
      const result = await useCase.execute({
        id: 1,
        name: 'Fresh Seafood',
        image: 'https://example.com/fresh-seafood.jpg',
      });

      expect(mockCategoryService.update).toHaveBeenCalledWith(1, {
        name: 'Fresh Seafood',
        image: 'https://example.com/fresh-seafood.jpg',
      });
      expect(result.category).toEqual(mockCategory);
    });

    it('should return null when category not found', async () => {
      vi.mocked(mockCategoryService.update).mockResolvedValue(null);

      const useCase = new UpdateCategoryUseCase(mockCategoryService);
      const result = await useCase.execute({
        id: 999,
        name: 'Non-existent',
      });

      expect(result.category).toBeNull();
    });
  });

  describe('GetCategoryByIdUseCase', () => {
    it('should return a category by id', async () => {
      const mockCategory: Category = {
        id: 1,
        name: 'Seafood',
        image: 'https://example.com/seafood.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockCategoryService.getById).mockResolvedValue(mockCategory);

      const useCase = new GetCategoryByIdUseCase(mockCategoryService);
      const result = await useCase.execute({ id: 1 });

      expect(mockCategoryService.getById).toHaveBeenCalledWith(1);
      expect(result.category).toEqual(mockCategory);
    });

    it('should return null when category not found', async () => {
      vi.mocked(mockCategoryService.getById).mockResolvedValue(null);

      const useCase = new GetCategoryByIdUseCase(mockCategoryService);
      const result = await useCase.execute({ id: 999 });

      expect(result.category).toBeNull();
    });
  });

  describe('GetCategoriesUseCase', () => {
    it('should return all categories', async () => {
      const mockCategories: Category[] = [
        {
          id: 1,
          name: 'Seafood',
          image: 'https://example.com/seafood.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Dried Seafood',
          image: 'https://example.com/dried.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(mockCategoryService.getAll).mockResolvedValue(mockCategories);

      const useCase = new GetCategoriesUseCase(mockCategoryService);
      const result = await useCase.execute();

      expect(mockCategoryService.getAll).toHaveBeenCalled();
      expect(result.categories).toEqual(mockCategories);
      expect(result.categories).toHaveLength(2);
    });

    it('should return empty array when no categories exist', async () => {
      vi.mocked(mockCategoryService.getAll).mockResolvedValue([]);

      const useCase = new GetCategoriesUseCase(mockCategoryService);
      const result = await useCase.execute();

      expect(result.categories).toEqual([]);
      expect(result.categories).toHaveLength(0);
    });
  });

  describe('DeleteCategoryUseCase', () => {
    it('should delete a category and return true', async () => {
      vi.mocked(mockCategoryService.delete).mockResolvedValue(true);

      const useCase = new DeleteCategoryUseCase(mockCategoryService);
      const result = await useCase.execute({ id: 1 });

      expect(mockCategoryService.delete).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
    });

    it('should return false when category not found', async () => {
      vi.mocked(mockCategoryService.delete).mockResolvedValue(false);

      const useCase = new DeleteCategoryUseCase(mockCategoryService);
      const result = await useCase.execute({ id: 999 });

      expect(result.success).toBe(false);
    });
  });
});
