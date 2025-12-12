import { SocialAuthRepository } from "@/infrastructure/repositories/social/social-auth-repo"
import { SaveYouTubeTokenUseCase } from "@/core/application/usecases/social/youtube/save-youtube-token"
import { GetYouTubeAuthUseCase } from "@/core/application/usecases/social/youtube/get-youtube-auth"
import { RefreshYouTubeTokenUseCase } from "@/core/application/usecases/social/youtube/refresh-youtube-token"
import { DisconnectYouTubeUseCase } from "@/core/application/usecases/social/youtube/disconnect-youtube"

const createSocialAuthRepository = async () => {
  return new SocialAuthRepository()
}

export const createSaveYouTubeTokenUseCase = async () => {
  const repo = await createSocialAuthRepository()
  return new SaveYouTubeTokenUseCase(repo)
}

export const createGetYouTubeAuthUseCase = async () => {
  const repo = await createSocialAuthRepository()
  return new GetYouTubeAuthUseCase(repo)
}

export const createRefreshYouTubeTokenUseCase = async () => {
  const socialAuthService = await createSocialAuthRepository()
  const { YouTubeAuthService } = await import("@/infrastructure/adapters/external/social/auth/youtube-auth-service")
  const PlatformOAuthService = new YouTubeAuthService({
    apiKey: process.env.YOUTUBE_API_KEY || "",
    clientId: process.env.YOUTUBE_CLIENT_ID || "",
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || "",
    refreshToken: "",
    accessToken: "",
    expiresAt: new Date(),
  })
  return new RefreshYouTubeTokenUseCase(PlatformOAuthService, socialAuthService)
}

export const createDisconnectYouTubeUseCase = async () => {
  const repo = await createSocialAuthRepository()
  return new DisconnectYouTubeUseCase(repo)
}
