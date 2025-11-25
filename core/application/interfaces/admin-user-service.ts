import type { AdminUser } from "@/core/domain/admin-user"
import { ObjectId } from "mongodb"

// Payload interfaces extending from domain
export interface AdminUserPayload extends Partial<AdminUser> { }

export interface ChangePasswordPayload {
  userId: ObjectId
  oldPassword: string
  newPassword: string
}

// Service interface
export interface AdminUserService {
  // Basic CRUD
  getAll(): Promise<AdminUser[]>
  getById(id: ObjectId): Promise<AdminUser | null>
  getByEmail(email: string): Promise<AdminUser | null>
  create(payload: AdminUserPayload): Promise<AdminUser>
  update(payload: AdminUserPayload & { id: ObjectId }): Promise<AdminUser | null>
  delete(id: ObjectId): Promise<boolean>

  // Authentication specific
  verifyCredentials(email: string, password: string): Promise<AdminUser | null>
  changePassword(payload: ChangePasswordPayload): Promise<boolean>
  resetPassword(email: string, newPassword: string): Promise<boolean>

  // Status management
  activate(id: ObjectId): Promise<boolean>
  deactivate(id: ObjectId): Promise<boolean>

  // Search/filter
  searchByName(name: string): Promise<AdminUser[]>
  filterByRole(role: "admin" | "sale" | "warehouse"): Promise<AdminUser[]>
  filterByStatus(status: "active" | "inactive"): Promise<AdminUser[]>
}
