import type { User } from "@/core/domain/user";

export interface UpsertUserPayload {
  id: string;
  name?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UserService {
  upsert(payload: UpsertUserPayload): Promise<User>;
  getById(id: string): Promise<User | null>;
}
