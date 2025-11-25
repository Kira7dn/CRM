import type { AdminUser } from "@/core/domain/admin-user"
import type { AdminUserService } from "@/core/application/interfaces/admin-user-service"

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user?: Omit<AdminUser, "password">
  message?: string
}

export class LoginUseCase {
  constructor(private adminUserService: AdminUserService) { }

  async execute(request: LoginRequest): Promise<LoginResponse> {
    // Validate input
    if (!request.email || !request.password) {
      return {
        success: false,
        message: "Email and password are required",
      }
    }

    // Verify credentials
    const user = await this.adminUserService.verifyCredentials(
      request.email,
      request.password
    )

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password",
      }
    }

    // Check if user is active
    if (user.status !== "active") {
      return {
        success: false,
        message: "Account is inactive. Please contact administrator.",
      }
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return {
      success: true,
      user: userWithoutPassword,
    }
  }
}
