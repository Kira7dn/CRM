import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateProductUseCase } from '../create-product';
import { UpdateProductUseCase } from '../update-product';
import { GetProductByIdUseCase } from '../get-product-by-id';
import { FilterProductsUseCase } from '../filter-products';
import { DeleteProductUseCase } from '../delete-product';
import type { ProductService } from '@/core/application/interfaces/product-service';
import type { Product } from '@/core/domain/product';

describe('Product Use Cases', () => {
  let mockProductService: ProductService;

  beforeEach(() => {
    mockProductService = {
      create: vi.fn(),
      update: vi.fn(),
      getById: vi.fn(),
      filter: vi.fn(),
      delete: vi.fn(),
    };
  });

  describe('CreateProductUseCase', () => {
    it('should create a product with all required fields', async () => {
      const mockProduct: Product = {
        id: 1,
        categoryId: 1,
        name: 'Fresh Crab',
        price: 200000,
        originalPrice: 250000,
        image: 'https://example.com/crab.jpg',
        detail: 'Fresh crab from Cô Tô',
      };

      vi.mocked(mockProductService.create).mockResolvedValue(mockProduct);

      const useCase = new CreateProductUseCase(mockProductService);
      const result = await useCase.execute({
        categoryId: 1,
        name: 'Fresh Crab',
        price: 200000,
        originalPrice: 250000,
        image: 'https://example.com/crab.jpg',
        detail: 'Fresh crab from Cô Tô',
      });

      expect(mockProductService.create).toHaveBeenCalled();
      expect(result.product).toEqual(mockProduct);
    });

    it('should create a product with optional sizes and colors', async () => {
      const mockProduct: Product = {
        id: 2,
        categoryId: 1,
        name: 'Premium Shrimp',
        price: 150000,
        sizes: [
          { label: 'Small', price: 100000 },
          { label: 'Large', price: 150000 },
        ],
        colors: ['red', 'orange'],
      };

      vi.mocked(mockProductService.create).mockResolvedValue(mockProduct);

      const useCase = new CreateProductUseCase(mockProductService);
      const result = await useCase.execute({
        categoryId: 1,
        name: 'Premium Shrimp',
        price: 150000,
        sizes: ['Small', 'Large'],
        colors: ['red', 'orange'],
      });

      expect(result.product.sizes).toBeDefined();
      expect(result.product.colors).toBeDefined();
    });
  });

  describe('UpdateProductUseCase', () => {
    it('should update an existing product', async () => {
      const mockProduct: Product = {
        id: 1,
        categoryId: 1,
        name: 'Updated Crab',
        price: 220000,
        originalPrice: 270000,
      };

      vi.mocked(mockProductService.update).mockResolvedValue(mockProduct);

      const useCase = new UpdateProductUseCase(mockProductService);
      const result = await useCase.execute({
        id: 1,
        name: 'Updated Crab',
        price: 220000,
        originalPrice: 270000,
      });

      expect(mockProductService.update).toHaveBeenCalledWith(1, expect.any(Object));
      expect(result.product).toEqual(mockProduct);
    });

    it('should return null when product not found', async () => {
      vi.mocked(mockProductService.update).mockResolvedValue(null);

      const useCase = new UpdateProductUseCase(mockProductService);
      const result = await useCase.execute({
        id: 999,
        name: 'Non-existent',
        price: 100000,
      });

      expect(result.product).toBeNull();
    });
  });

  describe('GetProductByIdUseCase', () => {
    it('should return a product by id', async () => {
      const mockProduct: Product = {
        id: 1,
        categoryId: 1,
        name: 'Fresh Crab',
        price: 200000,
        originalPrice: 250000,
      };

      vi.mocked(mockProductService.getById).mockResolvedValue(mockProduct);

      const useCase = new GetProductByIdUseCase(mockProductService);
      const result = await useCase.execute({ id: 1 });

      expect(mockProductService.getById).toHaveBeenCalledWith(1);
      expect(result.product).toEqual(mockProduct);
    });

    it('should return null when product not found', async () => {
      vi.mocked(mockProductService.getById).mockResolvedValue(null);

      const useCase = new GetProductByIdUseCase(mockProductService);
      const result = await useCase.execute({ id: 999 });

      expect(result.product).toBeNull();
    });
  });

  describe('FilterProductsUseCase', () => {
    it('should filter products by categoryId', async () => {
      const mockProducts: Product[] = [
        {
          id: 1,
          categoryId: 1,
          name: 'Crab',
          price: 200000,
        },
        {
          id: 2,
          categoryId: 1,
          name: 'Shrimp',
          price: 150000,
        },
      ];

      vi.mocked(mockProductService.filter).mockResolvedValue(mockProducts);

      const useCase = new FilterProductsUseCase(mockProductService);
      const result = await useCase.execute({ categoryId: 1 });

      expect(mockProductService.filter).toHaveBeenCalledWith({ categoryId: 1 });
      expect(result.products).toEqual(mockProducts);
      expect(result.products).toHaveLength(2);
    });

    it('should filter products by search keyword', async () => {
      const mockProducts: Product[] = [
        {
          id: 1,
          categoryId: 1,
          name: 'Fresh Crab',
          price: 200000,
        },
      ];

      vi.mocked(mockProductService.filter).mockResolvedValue(mockProducts);

      const useCase = new FilterProductsUseCase(mockProductService);
      const result = await useCase.execute({ search: 'crab' });

      expect(mockProductService.filter).toHaveBeenCalledWith({ search: 'crab' });
      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toContain('Crab');
    });

    it('should filter products by both categoryId and search', async () => {
      const mockProducts: Product[] = [
        {
          id: 1,
          categoryId: 1,
          name: 'Fresh Crab',
          price: 200000,
        },
      ];

      vi.mocked(mockProductService.filter).mockResolvedValue(mockProducts);

      const useCase = new FilterProductsUseCase(mockProductService);
      const result = await useCase.execute({ categoryId: 1, search: 'crab' });

      expect(mockProductService.filter).toHaveBeenCalledWith({
        categoryId: 1,
        search: 'crab',
      });
      expect(result.products).toHaveLength(1);
    });

    it('should return empty array when no products match filter', async () => {
      vi.mocked(mockProductService.filter).mockResolvedValue([]);

      const useCase = new FilterProductsUseCase(mockProductService);
      const result = await useCase.execute({ categoryId: 999 });

      expect(result.products).toEqual([]);
      expect(result.products).toHaveLength(0);
    });
  });

  describe('DeleteProductUseCase', () => {
    it('should delete a product and return true', async () => {
      vi.mocked(mockProductService.delete).mockResolvedValue(true);

      const useCase = new DeleteProductUseCase(mockProductService);
      const result = await useCase.execute({ id: 1 });

      expect(mockProductService.delete).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
    });

    it('should return false when product not found', async () => {
      vi.mocked(mockProductService.delete).mockResolvedValue(false);

      const useCase = new DeleteProductUseCase(mockProductService);
      const result = await useCase.execute({ id: 999 });

      expect(result.success).toBe(false);
    });
  });
});
