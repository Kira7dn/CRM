import { SocialAuthRepository } from "@/infrastructure/repositories/social/social-auth-repo"
import { OAuthAdapterFactory } from "@/infrastructure/adapters/social/factories/oauth-adapter-factory"

import { ConnectSocialAccountUseCase } from "@/core/application/usecases/social/connect-social"
import { RefreshTokenUseCase } from "@/core/application/usecases/social/refresh-token"
import { RevokeSocialAccountUseCase } from "@/core/application/usecases/social/revoke-social"
import { GetAuthorizationUrlUseCase } from "@/core/application/usecases/social/get-authorization-url"
import { NextResponse } from "next/server"

// Repository Singleton
let _repo: SocialAuthRepository | null = null
const getRepo = () => {
    if (!_repo) _repo = new SocialAuthRepository()
    return _repo
}

// Adapter Resolver Singleton
let _resolver: OAuthAdapterFactory | null = null
const getResolver = () => {
    if (!_resolver) _resolver = new OAuthAdapterFactory()
    return _resolver
}

// FACTORIES

export const createConnectSocialUseCase = () => {
    return new ConnectSocialAccountUseCase(
        getResolver(),
        getRepo()
    )
}

export const createRefreshTokenUseCase = () => {
    return new RefreshTokenUseCase(
        getResolver(),
        getRepo()
    )
}

export const createRevokeSocialAccountUseCase = () => {
    return new RevokeSocialAccountUseCase(
        getResolver(),
        getRepo()
    )
}

export const createGetAuthorizationUrlUseCase = () => {
    return new GetAuthorizationUrlUseCase(
        getResolver()
    )
}

// ---------------------------------------------------------------------------
// HELPER: redirect with error
// ---------------------------------------------------------------------------
export function redirectWithError(baseUrl: string, error: string, platform: string) {
    return NextResponse.redirect(
        `${baseUrl}/crm/social/connections?error=${encodeURIComponent(
            error
        )}&platform=${platform}`
    )
}
