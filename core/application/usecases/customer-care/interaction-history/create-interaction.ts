/**
 * Use Case: Create Interaction History
 */

import type { InteractionHistory } from "@/core/domain/customers/interaction-history";
import {
  validateInteractionHistory,
  generateContentPreview,
  calculateSentiment,
} from "@/core/domain/customers/interaction-history";
import type {
  InteractionHistoryService,
  InteractionHistoryPayload,
} from "@/core/application/interfaces/interaction-history-service";

export interface CreateInteractionRequest extends InteractionHistoryPayload { }

export interface CreateInteractionResponse {
  interaction: InteractionHistory;
}

export class CreateInteractionUseCase {
  constructor(private interactionService: InteractionHistoryService) { }

  async execute(
    request: CreateInteractionRequest
  ): Promise<CreateInteractionResponse> {
    // Validation
    const errors = validateInteractionHistory(request);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    // Auto-generate content preview
    const contentPreview = generateContentPreview(request.content || "");

    // Calculate sentiment if content is available
    let sentiment = request.metadata?.sentiment;
    let sentimentScore = request.metadata?.sentimentScore;

    if (request.content && !sentiment) {
      const analysis = calculateSentiment(request.content);
      sentiment = analysis.sentiment;
      sentimentScore = analysis.score;
    }

    // Create interaction with enriched data
    const interaction = await this.interactionService.create({
      ...request,
      contentPreview,
      metadata: {
        ...request.metadata,
        sentiment,
        sentimentScore,
      },
      occurredAt: request.occurredAt || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { interaction };
  }
}
