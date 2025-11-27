import type { SocialAuth, SocialPlatform } from "@/core/domain/social-auth"
import { ObjectId } from "mongodb"

// Payload interfaces extending from domain
export interface SocialAuthPayload extends Partial<SocialAuth> { }

export interface RefreshTokenPayload {
  userId: ObjectId
  platform: SocialPlatform
  newAccessToken: string
  newRefreshToken: string
  expiresInSeconds: number
}

// Service interface
export interface SocialAuthService {
  // Basic CRUD
  getById(id: ObjectId): Promise<SocialAuth | null>
  getByUserAndPlatform(
    userId: ObjectId,
    platform: SocialPlatform
  ): Promise<SocialAuth | null>
  create(payload: SocialAuthPayload): Promise<SocialAuth>
  update(
    payload: SocialAuthPayload & { id: ObjectId }
  ): Promise<SocialAuth | null>
  delete(id: ObjectId): Promise<boolean>

  // Platform-specific operations
  deleteByUserAndPlatform(
    userId: ObjectId,
    platform: SocialPlatform
  ): Promise<boolean>
  refreshToken(payload: RefreshTokenPayload): Promise<SocialAuth | null>
  getAllByUser(userId: ObjectId): Promise<SocialAuth[]>
  getAllByPlatform(platform: SocialPlatform): Promise<SocialAuth[]>
}
