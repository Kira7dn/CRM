import type { Category } from "@/core/domain/category";

export interface CategoryService {
  getAll(): Promise<Category[]>;
  getById(id: number): Promise<Category | null>;
  create(category: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<Category>;
  update(id: number, category: Partial<Omit<Category, "id" | "createdAt" | "updatedAt">>): Promise<Category | null>;
  delete(id: number): Promise<boolean>;
}
