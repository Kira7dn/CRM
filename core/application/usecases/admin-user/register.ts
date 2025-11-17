import type { AdminUser } from "@/core/domain/admin-user"
import { validateAdminUser, validatePassword } from "@/core/domain/admin-user"
import type { AdminUserService, CreateAdminUserPayload } from "@/core/application/interfaces/admin-user-service"

export interface RegisterAdminUserRequest extends CreateAdminUserPayload {}

export interface RegisterAdminUserResponse {
  user: Omit<AdminUser, "passwordHash">
}

export class RegisterAdminUserUseCase {
  constructor(private adminUserService: AdminUserService) {}

  async execute(request: RegisterAdminUserRequest): Promise<RegisterAdminUserResponse> {
    // Validate user data
    const userErrors = validateAdminUser({
      email: request.email,
      name: request.name,
      role: request.role,
      phone: request.phone,
      status: request.status,
    })

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
    const { passwordHash, ...userWithoutPassword } = user

    return { user: userWithoutPassword }
  }
}
