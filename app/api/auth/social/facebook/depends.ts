import { SocialAuthRepository } from "@/infrastructure/repositories/social/social-auth-repo"
import type { SocialAuthService } from "@/core/application/interfaces/social/social-auth-service"
import { SaveFacebookTokenUseCase } from "@/core/application/usecases/social/facebook/save-facebook-token"
import { GetFacebookAuthUseCase } from "@/core/application/usecases/social/facebook/get-facebook-auth"
import { RefreshFacebookTokenUseCase } from "@/core/application/usecases/social/facebook/refresh-facebook-token"
import { DisconnectFacebookUseCase } from "@/core/application/usecases/social/facebook/disconnect-facebook"

// Factory for repository
const createSocialAuthRepository = async (): Promise<SocialAuthService> => {
  return new SocialAuthRepository()
}

// Factory for use cases
export const createSaveFacebookTokenUseCase = async () => {
  const service = await createSocialAuthRepository()
  return new SaveFacebookTokenUseCase(service)
}

export const createGetFacebookAuthUseCase = async () => {
  const service = await createSocialAuthRepository()
  return new GetFacebookAuthUseCase(service)
}

export const createRefreshFacebookTokenUseCase = async () => {
  const socialAuthService = await createSocialAuthRepository()
  const { FacebookAuthService } = await import("@/infrastructure/adapters/external/social/auth/facebook-auth-service")
  const PlatformOAuthService = new FacebookAuthService({
    appId: process.env.FACEBOOK_APP_ID || "",
    appSecret: process.env.FACEBOOK_APP_SECRET || "",
    pageId: "",
    accessToken: "",
    expiresAt: new Date(),
  })
  return new RefreshFacebookTokenUseCase(PlatformOAuthService, socialAuthService)
}

export const createDisconnectFacebookUseCase = async () => {
  const service = await createSocialAuthRepository()
  return new DisconnectFacebookUseCase(service)
}
