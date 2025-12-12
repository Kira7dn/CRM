// infrastructure/adapters/external/social/factories/connect-usecase-factory.ts

import type { SocialPlatform } from "@/core/domain/social/social-auth";
import type { OAuthAdapterResolver } from "@/core/application/interfaces/social/oauth-adapter-resolver";
import { SocialAuthRepository } from "@/infrastructure/repositories/social/social-auth-repo";
import { ConnectSocialAccountUseCase } from "@/core/application/usecases/social/connect-social";
import { OAuthAdapterFactory } from "./auth-service-factory";

export async function createConnectUseCaseByPlatform(platform: SocialPlatform) {
    const socialAuthRepo = new SocialAuthRepository();
    const resolver = new OAuthAdapterFactory();

    return new ConnectSocialAccountUseCase(resolver, socialAuthRepo);
}
