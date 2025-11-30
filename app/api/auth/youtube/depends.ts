import { SocialAuthRepository } from "@/infrastructure/repositories/social-auth-repo"
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
  const repo = await createSocialAuthRepository()
  return new RefreshYouTubeTokenUseCase(repo)
}

export const createDisconnectYouTubeUseCase = async () => {
  const repo = await createSocialAuthRepository()
  return new DisconnectYouTubeUseCase(repo)
}
