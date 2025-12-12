import type { SocialAuthService } from "@/core/application/interfaces/social/social-auth-service";
import type { ObjectId } from "mongodb";

export interface DisconnectInstagramRequest {
  userId: ObjectId;
}

export interface DisconnectInstagramResponse {
  success: boolean;
}

/**
 * Use Case: Disconnect Instagram
 *
 * Removes the Instagram authentication data for a user
 * effectively disconnecting their Instagram Business Account
 */
export class DisconnectInstagramUseCase {
  constructor(private socialAuthService: SocialAuthService) {}

  async execute(request: DisconnectInstagramRequest): Promise<DisconnectInstagramResponse> {
    try {
      const auth = await this.socialAuthService.getByUserAndPlatform(
        request.userId,
        "instagram"
      );

      if (!auth) {
        return { success: false };
      }

      // Delete the authentication record
      await this.socialAuthService.delete(auth.id);

      return { success: true };
    } catch (error) {
      console.error("[DisconnectInstagramUseCase] Error:", error);
      return { success: false };
    }
  }
}
