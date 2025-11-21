import type { AdminUser } from "@/core/domain/managements/admin-user"
import { validateAdminUser, validatePassword } from "@/core/domain/managements/admin-user"
import type { AdminUserService, AdminUserPayload } from "@/core/application/interfaces/admin-user-service"


export interface RegisterAdminUserResponse {
  user: Omit<AdminUser, "password">
}

export class RegisterAdminUserUseCase {
  constructor(private adminUserService: AdminUserService) { }

  async execute(request: AdminUserPayload & { email: string, password: string }): Promise<RegisterAdminUserResponse> {
    // Validate user data
    const userErrors = validateAdminUser(request)

    if (userErrors.length > 0) {
      throw new Error(`Validation failed: ${userErrors.join(", ")}`)
    }

    // Validate password
    const passwordErrors = validatePassword(request.password)
    if (passwordErrors.length > 0) {
      throw new Error(`Password validation failed: ${passwordErrors.join(", ")}`)
    }

    // Check if email already exists
    const existingUser = await this.adminUserService.getByEmail(request.email)
    if (existingUser) {
      throw new Error("Email already exists")
    }

    // Create user
    const user = await this.adminUserService.create(request)

    // Remove password hash from response
    const { password, ...userWithoutPassword } = user

    return { user: userWithoutPassword }
  }
}
