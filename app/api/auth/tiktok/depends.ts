import { SocialAuthRepository } from "@/infrastructure/repositories/social-auth-repo"
import type { SocialAuthService } from "@/core/application/interfaces/social-auth-service"
import { SaveTikTokTokenUseCase } from "@/core/application/usecases/auth/facebook/tiktok/save-tiktok-token"
import { GetTikTokAuthUseCase } from "@/core/application/usecases/auth/facebook/tiktok/get-tiktok-auth"
import { RefreshTikTokTokenUseCase } from "@/core/application/usecases/auth/facebook/tiktok/refresh-tiktok-token"
import { DisconnectTikTokUseCase } from "@/core/application/usecases/auth/facebook/tiktok/disconnect-tiktok"

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
  const service = await createSocialAuthRepository()
  return new RefreshTikTokTokenUseCase(service)
}

export const createDisconnectTikTokUseCase = async () => {
  const service = await createSocialAuthRepository()
  return new DisconnectTikTokUseCase(service)
}
