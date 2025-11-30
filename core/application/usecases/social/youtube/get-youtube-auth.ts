import type { SocialAuth } from "@/core/domain/social-auth"
import type { SocialAuthService } from "@/core/application/interfaces/social-auth-service"
import { ObjectId } from "mongodb"

export interface GetYouTubeAuthRequest {
  userId: ObjectId
}

export interface GetYouTubeAuthResponse {
  socialAuth: SocialAuth | null
}

export class GetYouTubeAuthUseCase {
  constructor(private socialAuthService: SocialAuthService) {}

  async execute(
    request: GetYouTubeAuthRequest
  ): Promise<GetYouTubeAuthResponse> {
    const socialAuth = await this.socialAuthService.getByUserAndPlatform(
      request.userId,
      "youtube"
    )

    return { socialAuth }
  }
}
