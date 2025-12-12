import { SocialAuthRepository } from "@/infrastructure/repositories/social/social-auth-repo"
import type { SocialAuthService } from "@/core/application/interfaces/social/social-auth-service"
import { SaveWordPressTokenUseCase } from "@/core/application/usecases/social/wordpress/save-wordpress-token"
import { DisconnectWordPressUseCase } from "@/core/application/usecases/social/wordpress/disconnect-wordpress"
import { ExchangeWordPressTokenUseCase } from "@/core/application/usecases/social/wordpress/exchange-wordpress-token"
import { WordPressAuthService } from "@/infrastructure/adapters/external/social/auth/wordpress-auth-service"

// Factory for repository
const createSocialAuthRepository = async (): Promise<SocialAuthService> => {
  return new SocialAuthRepository()
}

// Factory for WordPress auth service (for OAuth flow, no token needed yet)
const createWordPressAuthService = async () => {
  // Create a minimal instance for OAuth operations
  // The actual token will be obtained through exchangeCodeForToken
  return new WordPressAuthService({
    accessToken: "", // Empty token - will be obtained through OAuth
    blogId: "",
    siteUrl: "",
  })
}

// Factory for use cases
export const createExchangeWordPressTokenUseCase = async () => {
  const authService = await createWordPressAuthService()
  return new ExchangeWordPressTokenUseCase(authService)
}

export const createSaveWordPressTokenUseCase = async () => {
  const service = await createSocialAuthRepository()
  return new SaveWordPressTokenUseCase(service)
}

export const createDisconnectWordPressUseCase = async () => {
  const service = await createSocialAuthRepository()
  return new DisconnectWordPressUseCase(service)
}
