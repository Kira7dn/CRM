import type { AdminUser } from "@/core/domain/admin-user"
import { validateAdminUser } from "@/core/domain/admin-user"
import type { AdminUserService, AdminUserPayload } from "@/core/application/interfaces/admin-user-service"
import { ObjectId } from "mongodb"

export interface UpdateAdminUserResponse {
  user: Omit<AdminUser, "password">
}

export class UpdateAdminUserUseCase {
  constructor(private adminUserService: AdminUserService) { }

  async execute(request: AdminUserPayload & { id: ObjectId }): Promise<UpdateAdminUserResponse> {
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
    const { password, ...userWithoutPassword } = user

    return { user: userWithoutPassword }
  }
}
