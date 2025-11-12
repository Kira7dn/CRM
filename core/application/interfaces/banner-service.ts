import type { Banner } from "@/core/domain/banner";

export interface BannerService {
  getAll(): Promise<Banner[]>;
  getById(id: number): Promise<Banner | null>;
  create(banner: Omit<Banner, "id">): Promise<Banner>;
  update(id: number, banner: Partial<Banner>): Promise<Banner | null>;
  delete(id: number): Promise<boolean>;
}
