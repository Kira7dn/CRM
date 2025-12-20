import type { AdminUser } from "@/core/domain/auth/admin-user"
import type {
  AdminUserService,
  AdminUserPayload,
  ChangePasswordPayload,
} from "@/core/application/interfaces/users/admin-user-service"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"
import { BaseRepository } from "@/infrastructure/db/base-repository"

export class AdminUserRepository
  extends BaseRepository<AdminUser, ObjectId>
  implements AdminUserService {
  protected collectionName = "admin_users"

  // Get all users
  async getAll(): Promise<AdminUser[]> {
    const collection = await this.getCollection()

    const docs = await collection.find({}).sort({ createdAt: -1 }).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  // Get user by ID
  async getById(id: ObjectId): Promise<AdminUser | null> {
    const collection = await this.getCollection()

    const doc = await collection.findOne({ _id: id })
    return doc ? this.toDomain(doc) : null
  }

  // Get user by email
  async getByEmail(email: string): Promise<AdminUser | null> {
    const collection = await this.getCollection()

    const doc = await collection.findOne({ email: email.toLowerCase() })
    return doc ? this.toDomain(doc) : null
  }

  // Create new admin user
  async create(payload: AdminUserPayload): Promise<AdminUser> {
    if (!payload.password || !payload.email) throw new Error("Password and email are required for admin user creation");

    const collection = await this.getCollection()
    // Hash password
    const password = await bcrypt.hash(payload.password, 10)
    const doc = this.toDocument({
      ...payload,
      password,
    })
    await collection.insertOne(doc)
    return this.toDomain(doc)
  }

  // Update user
  async update(payload: AdminUserPayload & { id: ObjectId }): Promise<AdminUser | null> {
    if (!payload.id) throw new Error("Admin user ID is required for update");

    const collection = await this.getCollection()
    const now = new Date();
    const { id, ...updateFields } = payload;
    const updateData: Partial<AdminUser> = {
      ...updateFields,
      updatedAt: now,
    }

    const result = await collection.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { returnDocument: "after" }
    )

    return result && result.value ? this.toDomain(result.value) : null
  }

  // Delete user
  async delete(id: ObjectId): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.deleteOne({ _id: id })
    return result.deletedCount ? result.deletedCount > 0 : false
  }

  // Verify credentials (for login)
  async verifyCredentials(
    email: string,
    password: string
  ): Promise<AdminUser | null> {
    // Validate inputs
    if (!email || !password) {
      console.error("verifyCredentials: email or password is missing", { email, password: !!password })
      return null
    }

    const user = await this.getByEmail(email)

    if (!user) {
      return null
    }

    // Ensure user has a password hash
    if (!user.password) {
      console.error("verifyCredentials: user has no password hash", { userId: user.id, email: user.email })
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return null
    }

    return user
  }

  // Change password
  async changePassword(payload: ChangePasswordPayload): Promise<boolean> {
    const collection = await this.getCollection()

    // First verify old password
    const user = await this.getById(payload.userId)
    if (!user) {
      return false
    }

    const isOldPasswordValid = await bcrypt.compare(
      payload.oldPassword,
      user.password
    )

    if (!isOldPasswordValid) {
      return false
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(payload.newPassword, 10)

    // Update password
    const result = await collection.updateOne(
      { _id: payload.userId },
      {
        $set: {
          password: newPasswordHash,
          updatedAt: new Date(),
        },
      }
    )

    return result.modifiedCount ? result.modifiedCount > 0 : false
  }

  // Reset password (admin function or forgot password)
  async resetPassword(email: string, newPassword: string): Promise<boolean> {
    const collection = await this.getCollection()

    const user = await this.getByEmail(email)
    if (!user) {
      return false
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Update password
    const result = await collection.updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          password: newPasswordHash,
          updatedAt: new Date(),
        },
      }
    )

    return result.modifiedCount ? result.modifiedCount > 0 : false
  }

  // Activate user
  async activate(id: ObjectId): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.updateOne(
      { _id: id },
      {
        $set: {
          status: "active",
          updatedAt: new Date(),
        },
      }
    )

    return result.modifiedCount ? result.modifiedCount > 0 : false
  }

  // Deactivate user
  async deactivate(id: ObjectId): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.updateOne(
      { _id: id },
      {
        $set: {
          status: "inactive",
          updatedAt: new Date(),
        },
      }
    )

    return result.modifiedCount ? result.modifiedCount > 0 : false
  }

  // Search by name
  async searchByName(name: string): Promise<AdminUser[]> {
    const collection = await this.getCollection()

    const docs = await collection
      .find({
        name: { $regex: name, $options: "i" },
      })
      .sort({ createdAt: -1 })
      .toArray()

    return docs.map((doc) => this.toDomain(doc))
  }

  // Filter by role
  async filterByRole(
    role: "admin" | "sale" | "warehouse"
  ): Promise<AdminUser[]> {
    const collection = await this.getCollection()

    const docs = await collection
      .find({ role })
      .sort({ createdAt: -1 })
      .toArray()

    return docs.map((doc) => this.toDomain(doc))
  }

  // Filter by status
  async filterByStatus(status: "active" | "inactive"): Promise<AdminUser[]> {
    const collection = await this.getCollection()

    const docs = await collection
      .find({ status })
      .sort({ createdAt: -1 })
      .toArray()

    return docs.map((doc) => this.toDomain(doc))
  }
}
