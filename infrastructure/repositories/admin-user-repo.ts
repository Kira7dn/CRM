import type { AdminUser } from "@/core/domain/admin-user"
import type {
  AdminUserService,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
  ChangePasswordPayload,
} from "@/core/application/interfaces/admin-user-service"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"
import { BaseRepository } from "../db/base-repository"

export class AdminUserRepository
  extends BaseRepository<AdminUser, string>
  implements AdminUserService
{
  protected collectionName = "admin_users"

  // Get all users
  async getAll(): Promise<AdminUser[]> {
    const collection = await this.getCollection()
    
    const docs = await collection.find({}).sort({ createdAt: -1 }).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  // Get user by ID
  async getById(id: string): Promise<AdminUser | null> {
    const collection = await this.getCollection()

    const doc = await collection.findOne({ _id: new ObjectId(id) })
    return doc ? this.toDomain(doc) : null
  }

  // Get user by email
  async getByEmail(email: string): Promise<AdminUser | null> {
    const collection = await this.getCollection()

    const doc = await collection.findOne({ email: email.toLowerCase() })
    return doc ? this.toDomain(doc) : null
  }

  // Create new admin user
  async create(payload: CreateAdminUserPayload): Promise<AdminUser> {
    const collection = await this.getCollection()

    // Hash password
    const passwordHash = await bcrypt.hash(payload.password, 10)

    const doc = {
      _id: new ObjectId(),
      email: payload.email.toLowerCase(),
      passwordHash,
      name: payload.name,
      role: payload.role,
      status: payload.status || "active",
      phone: payload.phone,
      avatar: payload.avatar,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await collection.insertOne(doc)
    return this.toDomain(doc)
  }

  // Update user
  async update(payload: UpdateAdminUserPayload): Promise<AdminUser | null> {
    const collection = await this.getCollection()

    const updateData: Partial<AdminUser> = {
      updatedAt: new Date(),
    }

    if (payload.name) updateData.name = payload.name
    if (payload.phone !== undefined) updateData.phone = payload.phone
    if (payload.avatar !== undefined) updateData.avatar = payload.avatar
    if (payload.status) updateData.status = payload.status
    if (payload.role) updateData.role = payload.role

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(payload.id) },
      { $set: updateData },
      { returnDocument: "after" }
    )

    return result && result.value ? this.toDomain(result.value) : null
  }

  // Delete user
  async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount ? result.deletedCount > 0 : false
  }

  // Verify credentials (for login)
  async verifyCredentials(
    email: string,
    password: string
  ): Promise<AdminUser | null> {
    const user = await this.getByEmail(email)

    if (!user) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

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
      user.passwordHash
    )

    if (!isOldPasswordValid) {
      return false
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(payload.newPassword, 10)

    // Update password
    const result = await collection.updateOne(
      { _id: new ObjectId(payload.userId) },
      {
        $set: {
          passwordHash: newPasswordHash,
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
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        },
      }
    )

    return result.modifiedCount ? result.modifiedCount > 0 : false
  }

  // Activate user
  async activate(id: string): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
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
  async deactivate(id: string): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
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

  // Convert domain entity to MongoDB document
  protected toDocument(entity: AdminUser): any {
    const doc = super.toDocument(entity);
    // Ensure _id is ObjectId if it exists
    if (entity.id) {
      doc._id = new ObjectId(entity.id);
    }
    return doc;
  }
}
