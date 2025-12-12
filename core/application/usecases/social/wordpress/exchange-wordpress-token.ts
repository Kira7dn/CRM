import type { PlatformOAuthService } from "@/core/application/interfaces/social/platform-oauth-adapter"

export interface ExchangeWordPressTokenRequest {
  code: string
  clientId: string
  clientSecret: string
  redirectUri: string
}

export interface ExchangeWordPressTokenResponse {
  success: boolean
  accessToken?: string
  blogId?: string
  blogUrl?: string
  scope?: string
  message?: string
}

export class ExchangeWordPressTokenUseCase {
  constructor(private authService: PlatformOAuthService) { }

  async execute(
    request: ExchangeWordPressTokenRequest
  ): Promise<ExchangeWordPressTokenResponse> {
    try {
      if (!this.authService.exchangeCodeForToken) {
        throw new Error("Platform does not support code exchange")
      }

      const tokenData = await this.authService.exchangeCodeForToken(
        request.code,
        request.clientId,
        request.clientSecret,
        request.redirectUri
      )

      return {
        success: true,
        accessToken: tokenData.access_token,
        blogId: (tokenData as any).blog_id,
        blogUrl: (tokenData as any).blog_url,
        scope: (tokenData as any).scope,
      }
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to exchange WordPress authorization code",
      }
    }
  }
}
