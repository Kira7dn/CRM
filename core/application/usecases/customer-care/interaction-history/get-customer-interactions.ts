/**
 * Use Case: Get Customer Interaction History
 */

import type { InteractionHistory } from "@/core/domain/customer-care/interaction-history";
import type { InteractionHistoryService } from "@/core/application/interfaces/interaction-history-service";

export interface GetCustomerInteractionsRequest {
  customerId: string;
  limit?: number;
}

export interface GetCustomerInteractionsResponse {
  interactions: InteractionHistory[];
  customerId: string;
}

export class GetCustomerInteractionsUseCase {
  constructor(private interactionService: InteractionHistoryService) {}

  async execute(
    request: GetCustomerInteractionsRequest
  ): Promise<GetCustomerInteractionsResponse> {
    if (!request.customerId) {
      throw new Error("Customer ID is required");
    }

    const interactions = await this.interactionService.getByCustomer(
      request.customerId,
      request.limit || 100
    );

    return {
      interactions,
      customerId: request.customerId,
    };
  }
}
