import type { SocialAuthService } from "@/core/application/interfaces/social/social-auth-service";
import type { SocialAuth } from "@/core/domain/social/social-auth";
import type { ObjectId } from "mongodb";

export interface GetInstagramAuthRequest {
  userId: ObjectId;
}

export interface GetInstagramAuthResponse {
  auth: SocialAuth | null;
}

/**
 * Use Case: Get Instagram Authentication
 *
 * Retrieves the stored Instagram authentication data for a user
 */
export class GetInstagramAuthUseCase {
  constructor(private socialAuthService: SocialAuthService) {}

  async execute(request: GetInstagramAuthRequest): Promise<GetInstagramAuthResponse> {
    try {
      const auth = await this.socialAuthService.getByUserAndPlatform(
        request.userId,
        "instagram"
      );

      return { auth };
    } catch (error) {
      console.error("[GetInstagramAuthUseCase] Error:", error);
      throw error;
    }
  }
}
