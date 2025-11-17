import type { AdminUser } from "@/core/domain/admin-user"
import type { AdminUserService } from "@/core/application/interfaces/admin-user-service"

export interface GetCurrentUserRequest {
  userId: string
}

export interface GetCurrentUserResponse {
  user: Omit<AdminUser, "passwordHash"> | null
}

export class GetCurrentUserUseCase {
  constructor(private adminUserService: AdminUserService) {}

  async execute(request: GetCurrentUserRequest): Promise<GetCurrentUserResponse> {
    if (!request.userId) {
      return { user: null }
    }

    const user = await this.adminUserService.getById(request.userId)

    if (!user) {
      return { user: null }
    }

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user

    return { user: userWithoutPassword }
  }
}
