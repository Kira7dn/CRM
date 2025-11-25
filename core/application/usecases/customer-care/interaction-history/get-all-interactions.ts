/**
 * Use Case: Get All Interactions with Filters
 */

import type { InteractionHistory } from "@/core/domain/customers/interaction-history";
import type {
  InteractionHistoryService,
  InteractionHistoryFilters,
} from "@/core/application/interfaces/interaction-history-service";

export interface GetAllInteractionsRequest {
  filters?: InteractionHistoryFilters;
}

export interface GetAllInteractionsResponse {
  interactions: InteractionHistory[];
  total: number;
}

export class GetAllInteractionsUseCase {
  constructor(private interactionService: InteractionHistoryService) { }

  async execute(
    request: GetAllInteractionsRequest = {}
  ): Promise<GetAllInteractionsResponse> {
    const filters = request.filters || {};

    // Apply default pagination if not specified
    const paginatedFilters: InteractionHistoryFilters = {
      ...filters,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    };

    const interactions =
      await this.interactionService.getAll(paginatedFilters);

    return {
      interactions,
      total: interactions.length,
    };
  }
}
