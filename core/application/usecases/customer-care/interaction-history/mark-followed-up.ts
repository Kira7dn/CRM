/**
 * Use Case: Mark Interaction as Followed Up
 */

import type { InteractionHistory } from "@/core/domain/customer-care/interaction-history";
import type { InteractionHistoryService } from "@/core/application/interfaces/interaction-history-service";

export interface MarkFollowedUpRequest {
  interactionId: string;
}

export interface MarkFollowedUpResponse {
  interaction: InteractionHistory | null;
}

export class MarkFollowedUpUseCase {
  constructor(private interactionService: InteractionHistoryService) {}

  async execute(
    request: MarkFollowedUpRequest
  ): Promise<MarkFollowedUpResponse> {
    if (!request.interactionId) {
      throw new Error("Interaction ID is required");
    }

    const interaction = await this.interactionService.markFollowedUp(
      request.interactionId
    );

    if (!interaction) {
      throw new Error("Interaction not found");
    }

    return { interaction };
  }
}
