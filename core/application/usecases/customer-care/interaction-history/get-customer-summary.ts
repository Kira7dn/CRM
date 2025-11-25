/**
 * Use Case: Get Customer Interaction Summary
 */

import type { CustomerInteractionSummary } from "@/core/domain/customers/interaction-history";
import type { InteractionHistoryService } from "@/core/application/interfaces/interaction-history-service";

export interface GetCustomerSummaryRequest {
  customerId: string;
}

export interface GetCustomerSummaryResponse {
  summary: CustomerInteractionSummary | null;
}

export class GetCustomerSummaryUseCase {
  constructor(private interactionService: InteractionHistoryService) { }

  async execute(
    request: GetCustomerSummaryRequest
  ): Promise<GetCustomerSummaryResponse> {
    if (!request.customerId) {
      throw new Error("Customer ID is required");
    }

    const summary = await this.interactionService.getSummary(
      request.customerId
    );

    return { summary };
  }
}
