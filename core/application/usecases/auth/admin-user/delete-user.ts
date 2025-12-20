import { ObjectId } from "mongodb"
import type { AdminUserService } from "@/core/application/interfaces/users/admin-user-service"

export interface DeleteAdminUserRequest {
  userId: string
}

export interface DeleteAdminUserResponse {
  success: boolean
  message?: string
}

export class DeleteAdminUserUseCase {
  constructor(private adminUserService: AdminUserService) {}

  async execute(request: DeleteAdminUserRequest): Promise<DeleteAdminUserResponse> {
    if (!request.userId) {
      return {
        success: false,
        message: "User ID is required",
      }
    }

    // Convert string ID to ObjectId
    let userId: ObjectId
    try {
      userId = new ObjectId(request.userId)
    } catch (error) {
      return {
        success: false,
        message: "Invalid user ID format",
      }
    }

    // Check if user exists
    const user = await this.adminUserService.getById(userId)
    if (!user) {
      return {
        success: false,
        message: "User not found",
      }
    }

    // Prevent deleting the last admin
    if (user.role === "admin") {
      const allUsers = await this.adminUserService.getAll()
      const adminCount = allUsers.filter(u => u.role === "admin" && u.status === "active").length

      if (adminCount <= 1) {
        return {
          success: false,
          message: "Cannot delete the last active admin user",
        }
      }
    }

    // Delete user
    const success = await this.adminUserService.delete(userId)

    return {
      success,
      message: success ? "User deleted successfully" : "Failed to delete user",
    }
  }
}
