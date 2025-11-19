/**
 * Get Top Products Use Case
 *
 * Retrieves top-performing products by revenue for a given period.
 */

import {
  TopProduct,
  validateDateRange,
} from "@/core/domain/analytics/revenue-metrics";
import {
  RevenueAnalyticsService,
  TopItemsQuery,
} from "@/core/application/interfaces/analytics/revenue-analytics-service";

export interface GetTopProductsRequest extends TopItemsQuery {}

export interface GetTopProductsResponse {
  products: TopProduct[];
}

export class GetTopProductsUseCase {
  constructor(private revenueAnalyticsService: RevenueAnalyticsService) {}

  async execute(request: GetTopProductsRequest): Promise<GetTopProductsResponse> {
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

    // Fetch top products
    const products = await this.revenueAnalyticsService.getTopProducts(request);

    return { products };
  }
}
