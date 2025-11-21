import type { User } from "@/core/domain/managements/user";

export interface UserPayload extends Partial<User> { }

export interface UpsertUserPayload extends UserPayload {
  id: string; // Required for upsert operations
}

export interface UserService {
  upsert(payload: UpsertUserPayload): Promise<User>;
  getById(id: string): Promise<User | null>;
}
