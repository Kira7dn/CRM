/**
 * Get Top Customers Use Case
 *
 * Retrieves top customers by revenue for a given period.
 */

import {
  TopCustomer,
  validateDateRange,
} from "@/core/domain/analytics/revenue-metrics";
import {
  RevenueAnalyticsService,
  TopItemsQuery,
} from "@/core/application/interfaces/analytics/revenue-analytics-service";

export interface GetTopCustomersRequest extends TopItemsQuery {}

export interface GetTopCustomersResponse {
  customers: TopCustomer[];
}

export class GetTopCustomersUseCase {
  constructor(private revenueAnalyticsService: RevenueAnalyticsService) {}

  async execute(request: GetTopCustomersRequest): Promise<GetTopCustomersResponse> {
    // Validate date range
    const errors = validateDateRange({
      startDate: request.startDate,
      endDate: request.endDate,
    });

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    // Validate limit
    if (request.limit <= 0) {
      throw new Error("Limit must be greater than 0");
    }

    if (request.limit > 100) {
      throw new Error("Limit cannot exceed 100");
    }

    // Fetch top customers
    const customers = await this.revenueAnalyticsService.getTopCustomers(request);

    return { customers };
  }
}
