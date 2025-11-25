import type { Banner } from "@/core/domain/campaigns/banner";

export interface BannerPayload extends Partial<Banner> { }

export interface BannerService {
  getAll(): Promise<Banner[]>;
  getById(id: number): Promise<Banner | null>;
  create(payload: BannerPayload): Promise<Banner>;
  update(payload: BannerPayload & { id: number }): Promise<Banner | null>;
  delete(id: number): Promise<boolean>;
}
