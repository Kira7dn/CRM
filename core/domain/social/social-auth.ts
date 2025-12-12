// Domain entity for Social Media Authentication (OAuth tokens)

import { ObjectId } from "mongodb"

export type SocialPlatform = "tiktok" | "facebook" | "youtube" | "zalo" | "wordpress" | "instagram"

export class SocialAuth {
  constructor(
    public readonly id: ObjectId = new ObjectId(),
    public platform: SocialPlatform,
    public openId: string,
    public pageName: string,
    public accessToken: string,
    public expiresAt: Date,
    public userId: ObjectId, // Reference to AdminUser
    public refreshToken?: string,
    public scope?: string, // OAuth scopes granted
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) { }
}

// Validation function for social auth creation/update
export function validateSocialAuth(auth: Partial<SocialAuth>): string[] {
  const errors: string[] = []

  // Platform validation
  if (!auth.platform) {
    errors.push("Platform is required")
  } else if (!["tiktok", "facebook", "youtube", "zalo", "wordpress", "instagram"].includes(auth.platform)) {
    errors.push("Platform must be one of: tiktok, facebook, youtube, zalo, wordpress, instagram")
  }

  // OpenId validation
  if (!auth.openId || auth.openId.trim().length === 0) {
    errors.push("OpenId is required")
  }

  // Page name validation
  if (!auth.pageName || auth.pageName.trim().length === 0) {
    errors.push("Page name is required")
  }

  // Access token validation
  if (!auth.accessToken || auth.accessToken.trim().length === 0) {
    errors.push("Access token is required")
  }

  // Refresh token validation - optional for platforms that don't support it
  // Some platforms (Facebook/Instagram page tokens) use access token as refresh token

  // Expires at validation
  if (!auth.expiresAt) {
    errors.push("Expiration date is required")
  } else if (!(auth.expiresAt instanceof Date)) {
    errors.push("Expiration date must be a valid Date object")
  }

  // UserId validation
  if (!auth.userId) {
    errors.push("User ID is required")
  }

  return errors
}

// Helper function to check if token is expired
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() >= expiresAt
}

// Helper function to calculate expiration date from seconds
export function calculateExpiresAt(expiresInSeconds: number): Date {
  const now = new Date()
  return new Date(now.getTime() + expiresInSeconds * 1000)
}
