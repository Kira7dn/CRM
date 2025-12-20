import type { AdminUser } from "@/core/domain/auth/admin-user"
import type { AdminUserService } from "@/core/application/interfaces/users/admin-user-service"

export interface GetAllUsersRequest {
  role?: "admin" | "sale" | "warehouse"
  status?: "active" | "inactive"
}

export interface GetAllUsersResponse {
  users: Omit<AdminUser, "password">[]
}

export class GetAllUsersUseCase {
  constructor(private adminUserService: AdminUserService) { }

  async execute(request: GetAllUsersRequest): Promise<GetAllUsersResponse> {
    let users: AdminUser[]

    // Apply filters
    if (request.role) {
      users = await this.adminUserService.filterByRole(request.role)
    } else if (request.status) {
      users = await this.adminUserService.filterByStatus(request.status)
    } else {
      users = await this.adminUserService.getAll()
    }

    // Remove password hashes from all users
    const usersWithoutPasswords = users.map(({ password, ...user }) => user)

    return { users: usersWithoutPasswords }
  }
}
