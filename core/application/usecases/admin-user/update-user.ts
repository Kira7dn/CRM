import type { AdminUser } from "@/core/domain/admin-user"
import { validateAdminUser } from "@/core/domain/admin-user"
import type { AdminUserService, UpdateAdminUserPayload } from "@/core/application/interfaces/admin-user-service"

export interface UpdateAdminUserRequest extends UpdateAdminUserPayload {}

export interface UpdateAdminUserResponse {
  user: Omit<AdminUser, "passwordHash">
}

export class UpdateAdminUserUseCase {
  constructor(private adminUserService: AdminUserService) {}

  async execute(request: UpdateAdminUserRequest): Promise<UpdateAdminUserResponse> {
    // Validate update data
    const errors = validateAdminUser(request)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`)
    }

    // Update user
    const user = await this.adminUserService.update(request)

    if (!user) {
      throw new Error("User not found or update failed")
    }

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user

    return { user: userWithoutPassword }
  }
}
