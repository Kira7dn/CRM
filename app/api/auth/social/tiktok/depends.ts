import { SocialAuthRepository } from "@/infrastructure/repositories/social/social-auth-repo"
import type { SocialAuthService } from "@/core/application/interfaces/social/social-auth-service"
import { SaveTikTokTokenUseCase } from "@/core/application/usecases/social/tiktok/save-tiktok-token"
import { GetTikTokAuthUseCase } from "@/core/application/usecases/social/tiktok/get-tiktok-auth"
import { RefreshTikTokTokenUseCase } from "@/core/application/usecases/social/tiktok/refresh-tiktok-token"
import { DisconnectTikTokUseCase } from "@/core/application/usecases/social/tiktok/disconnect-tiktok"

// Factory for repository
const createSocialAuthRepository = async (): Promise<SocialAuthService> => {
  return new SocialAuthRepository()
}

// Factory for use cases
export const createSaveTikTokTokenUseCase = async () => {
  const service = await createSocialAuthRepository()
  return new SaveTikTokTokenUseCase(service)
}

export const createGetTikTokAuthUseCase = async () => {
  const service = await createSocialAuthRepository()
  return new GetTikTokAuthUseCase(service)
}

export const createRefreshTikTokTokenUseCase = async () => {
  const socialAuthService = await createSocialAuthRepository()
  const { TikTokAuthService } = await import("@/infrastructure/adapters/external/social/auth/tiktok-auth-service")
  const PlatformOAuthService = new TikTokAuthService({
    clientKey: process.env.TIKTOK_CLIENT_KEY || "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
    accessToken: "",
    refreshToken: "",
    expiresAt: new Date(),
  })
  return new RefreshTikTokTokenUseCase(PlatformOAuthService, socialAuthService)
}

export const createDisconnectTikTokUseCase = async () => {
  const service = await createSocialAuthRepository()
  return new DisconnectTikTokUseCase(service)
}
