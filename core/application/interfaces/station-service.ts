import type { Station } from "@/core/domain/managements/station";

export interface StationPayload extends Partial<Station> { }

export interface StationService {
  getAll(): Promise<Station[]>;
  getById(id: number): Promise<Station | null>;
  create(payload: StationPayload): Promise<Station>;
  update(payload: StationPayload & { id: number }): Promise<Station | null>;
  delete(id: number): Promise<boolean>;
}
