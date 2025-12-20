import { ObjectId } from "mongodb"
import type { AdminUser } from "@/core/domain/auth/admin-user"
import type { AdminUserService } from "@/core/application/interfaces/users/admin-user-service"

export interface GetCurrentUserRequest {
  userId: string
}

export interface GetCurrentUserResponse {
  user: Omit<AdminUser, "password"> | null
}

export class GetCurrentUserUseCase {
  constructor(private adminUserService: AdminUserService) { }

  async execute(request: GetCurrentUserRequest): Promise<GetCurrentUserResponse> {
    if (!request.userId) {
      return { user: null }
    }

    let userId: ObjectId
    try {
      userId = new ObjectId(request.userId)
    } catch (error) {
      return { user: null }
    }

    const user = await this.adminUserService.getById(userId)

    if (!user) {
      return { user: null }
    }

    // Remove password hash from response
    const { password, ...userWithoutPassword } = user

    return { user: userWithoutPassword }
  }
}
