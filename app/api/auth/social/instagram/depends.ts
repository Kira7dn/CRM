import { SocialAuthRepository } from "@/infrastructure/repositories/social/social-auth-repo";
import type { SocialAuthService } from "@/core/application/interfaces/social/social-auth-service";
import { SaveInstagramTokenUseCase } from "@/core/application/usecases/social/instagram/save-instagram-token";
import { GetInstagramAuthUseCase } from "@/core/application/usecases/social/instagram/get-instagram-auth";
import { RefreshInstagramTokenUseCase } from "@/core/application/usecases/social/instagram/refresh-instagram-token";
import { DisconnectInstagramUseCase } from "@/core/application/usecases/social/instagram/disconnect-instagram";

// Factory for repository
const createSocialAuthRepository = async (): Promise<SocialAuthService> => {
  return new SocialAuthRepository();
};

// Factory for use cases
export const createSaveInstagramTokenUseCase = async () => {
  const service = await createSocialAuthRepository();
  return new SaveInstagramTokenUseCase(service);
};

export const createRefreshInstagramTokenUseCase = async () => {
  const socialAuthService = await createSocialAuthRepository()
  const { InstagramAuthService } = await import("@/infrastructure/adapters/external/social/auth/instagram-auth-service")
  const PlatformOAuthService = new InstagramAuthService({
    appId: process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID || "",
    appSecret: process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET || "",
    pageId: "",
    instagramBusinessAccountId: "",
    accessToken: "",
    expiresAt: new Date(),
  })
  return new RefreshInstagramTokenUseCase(PlatformOAuthService, socialAuthService)
}

export const createDisconnectInstagramUseCase = async () => {
  const service = await createSocialAuthRepository();
  return new DisconnectInstagramUseCase(service);
};
