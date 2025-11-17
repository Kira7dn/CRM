import { validatePassword } from "@/core/domain/admin-user"
import type { AdminUserService, ChangePasswordPayload } from "@/core/application/interfaces/admin-user-service"

export interface ChangePasswordRequest extends ChangePasswordPayload {}

export interface ChangePasswordResponse {
  success: boolean
  message?: string
}

export class ChangePasswordUseCase {
  constructor(private adminUserService: AdminUserService) {}

  async execute(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    // Validate new password
    const passwordErrors = validatePassword(request.newPassword)
    if (passwordErrors.length > 0) {
      return {
        success: false,
        message: `Password validation failed: ${passwordErrors.join(", ")}`,
      }
    }

    // Change password
    const success = await this.adminUserService.changePassword(request)

    if (!success) {
      return {
        success: false,
        message: "Failed to change password. Please check your current password.",
      }
    }

    return {
      success: true,
      message: "Password changed successfully",
    }
  }
}
