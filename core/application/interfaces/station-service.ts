import type { Station } from "@/core/domain/station";

export interface StationService {
  getAll(): Promise<Station[]>;
  getById(id: number): Promise<Station | null>;
  create(station: Omit<Station, "id" | "createdAt" | "updatedAt">): Promise<Station>;
  update(id: number, station: Partial<Omit<Station, "id" | "createdAt" | "updatedAt">>): Promise<Station | null>;
  delete(id: number): Promise<boolean>;
}
