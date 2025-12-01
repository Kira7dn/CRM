import { ProductRepository } from '@/infrastructure/repositories/catalog/product-repo';
import type { ProductService } from '@/core/application/interfaces/catalog/product-service';
import { FilterProductsUseCase } from '@/core/application/usecases/catalog/product/filter-products';
import { CreateProductUseCase } from '@/core/application/usecases/catalog/product/create-product';
import { GetProductByIdUseCase } from '@/core/application/usecases/catalog/product/get-product-by-id';
import { UpdateProductUseCase } from '@/core/application/usecases/catalog/product/update-product';
import { DeleteProductUseCase } from '@/core/application/usecases/catalog/product/delete-product';

// Create ProductRepository instance
const createProductRepository = async (): Promise<ProductService> => {
  return new ProductRepository();
};

// Create use case instances
export const filterProductsUseCase = async () => {
  const productService = await createProductRepository();
  return new FilterProductsUseCase(productService);
};

export const createProductUseCase = async () => {
  const productService = await createProductRepository();
  return new CreateProductUseCase(productService);
};

export const getProductByIdUseCase = async () => {
  const productService = await createProductRepository();
  return new GetProductByIdUseCase(productService);
};

export const updateProductUseCase = async () => {
  const productService = await createProductRepository();
  return new UpdateProductUseCase(productService);
};

export const deleteProductUseCase = async () => {
  const productService = await createProductRepository();
  return new DeleteProductUseCase(productService);
};
