import type { Category } from "@/core/domain/managements/category";

export interface CategoryPayload extends Partial<Category> { }

export interface CategoryService {
  getAll(): Promise<Category[]>;
  getById(id: number): Promise<Category | null>;
  create(payload: CategoryPayload): Promise<Category>;
  update(payload: CategoryPayload & { id: number }): Promise<Category | null>;
  delete(id: number): Promise<boolean>;
}
