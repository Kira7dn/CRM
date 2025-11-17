// Domain entity for Admin users with role-based access control

export type AdminRole = "admin" | "sale" | "warehouse"
export type AdminStatus = "active" | "inactive"

export interface AdminUser {
  id: string                // MongoDB ObjectId or generated UUID
  email: string
  passwordHash: string
  name: string
  role: AdminRole
  status: AdminStatus
  avatar?: string
  phone?: string
  createdAt: Date
  updatedAt: Date
}

// Validation function for admin user creation/update
export function validateAdminUser(user: Partial<AdminUser>): string[] {
  const errors: string[] = []

  // Email validation
  if (!user.email) {
    errors.push("Email is required")
  } else if (!isValidEmail(user.email)) {
    errors.push("Email format is invalid")
  }

  // Name validation
  if (!user.name || user.name.trim().length === 0) {
    errors.push("Name is required")
  }

  // Role validation
  if (!user.role) {
    errors.push("Role is required")
  } else if (!["admin", "sale", "warehouse"].includes(user.role)) {
    errors.push("Role must be one of: admin, sale, warehouse")
  }

  // Status validation (if provided)
  if (user.status && !["active", "inactive"].includes(user.status)) {
    errors.push("Status must be either active or inactive")
  }

  // Phone validation (if provided)
  if (user.phone && user.phone.trim().length > 0) {
    if (!isValidPhone(user.phone)) {
      errors.push("Phone number format is invalid")
    }
  }

  return errors
}

// Validation for password
export function validatePassword(password: string): string[] {
  const errors: string[] = []

  if (!password || password.length === 0) {
    errors.push("Password is required")
  } else if (password.length < 8) {
    errors.push("Password must be at least 8 characters")
  } else if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  } else if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  } else if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  return errors
}

// Helper: Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Helper: Phone validation (Vietnamese format)
function isValidPhone(phone: string): boolean {
  // Vietnamese phone: starts with 0, 10-11 digits
  const phoneRegex = /^0[0-9]{9,10}$/
  return phoneRegex.test(phone.replace(/[\s-]/g, ""))
}

// Permission checker utilities
export const Permissions = {
  canManageUsers: (role: AdminRole): boolean => {
    return role === "admin"
  },

  canManageProducts: (role: AdminRole): boolean => {
    return role === "admin"
  },

  canViewProducts: (role: AdminRole): boolean => {
    return ["admin", "sale", "warehouse"].includes(role)
  },

  canManageOrders: (role: AdminRole): boolean => {
    return role === "admin"
  },

  canUpdateOrderStatus: (role: AdminRole): boolean => {
    return ["admin", "warehouse"].includes(role)
  },

  canViewOrders: (role: AdminRole): boolean => {
    return ["admin", "sale", "warehouse"].includes(role)
  },

  canManageCustomers: (role: AdminRole): boolean => {
    return role === "admin"
  },

  canViewCustomers: (role: AdminRole): boolean => {
    return ["admin", "sale"].includes(role)
  },

  canManageContent: (role: AdminRole): boolean => {
    // Banners, Posts, Campaigns
    return role === "admin"
  },

  canViewContent: (role: AdminRole): boolean => {
    return ["admin", "sale"].includes(role)
  },

  canManageStations: (role: AdminRole): boolean => {
    return role === "admin"
  },

  canViewDashboard: (role: AdminRole): boolean => {
    return ["admin", "sale", "warehouse"].includes(role)
  },
}
