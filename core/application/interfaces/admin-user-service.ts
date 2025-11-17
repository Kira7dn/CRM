import type { AdminUser } from "@/core/domain/admin-user"

// Payload interfaces extending from domain
export interface AdminUserPayload extends Partial<AdminUser> {}

export interface CreateAdminUserPayload {
  email: string
  password: string
  name: string
  role: "admin" | "sale" | "warehouse"
  phone?: string
  avatar?: string
  status?: "active" | "inactive"
}

export interface UpdateAdminUserPayload {
  id: string
  name?: string
  phone?: string
  avatar?: string
  status?: "active" | "inactive"
  role?: "admin" | "sale" | "warehouse"
}

export interface ChangePasswordPayload {
  userId: string
  oldPassword: string
  newPassword: string
}

// Service interface
export interface AdminUserService {
  // Basic CRUD
  getAll(): Promise<AdminUser[]>
  getById(id: string): Promise<AdminUser | null>
  getByEmail(email: string): Promise<AdminUser | null>
  create(payload: CreateAdminUserPayload): Promise<AdminUser>
  update(payload: UpdateAdminUserPayload): Promise<AdminUser | null>
  delete(id: string): Promise<boolean>

  // Authentication specific
  verifyCredentials(email: string, password: string): Promise<AdminUser | null>
  changePassword(payload: ChangePasswordPayload): Promise<boolean>
  resetPassword(email: string, newPassword: string): Promise<boolean>

  // Status management
  activate(id: string): Promise<boolean>
  deactivate(id: string): Promise<boolean>

  // Search/filter
  searchByName(name: string): Promise<AdminUser[]>
  filterByRole(role: "admin" | "sale" | "warehouse"): Promise<AdminUser[]>
  filterByStatus(status: "active" | "inactive"): Promise<AdminUser[]>
}
