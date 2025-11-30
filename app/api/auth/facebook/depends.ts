import { SocialAuthRepository } from "@/infrastructure/repositories/social-auth-repo"
import type { SocialAuthService } from "@/core/application/interfaces/social-auth-service"
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
  const service = await createSocialAuthRepository()
  return new RefreshFacebookTokenUseCase(service)
}

export const createDisconnectFacebookUseCase = async () => {
  const service = await createSocialAuthRepository()
  return new DisconnectFacebookUseCase(service)
}
