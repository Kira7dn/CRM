/**
 * Get Order Status Distribution Use Case
 *
 * Retrieves order status breakdown with counts and percentages.
 */

import {
  OrderStatusDistribution,
  validateDateRange,
} from "@/core/domain/analytics/revenue-metrics";
import {
  RevenueAnalyticsService,
  OrderStatusQuery,
} from "@/core/application/interfaces/analytics/revenue-analytics-service";

export interface GetOrderStatusDistributionRequest extends OrderStatusQuery {}

export interface GetOrderStatusDistributionResponse {
  distribution: OrderStatusDistribution[];
}

export class GetOrderStatusDistributionUseCase {
  constructor(private revenueAnalyticsService: RevenueAnalyticsService) {}

  async execute(request: GetOrderStatusDistributionRequest): Promise<GetOrderStatusDistributionResponse> {
    // Validate date range
    const errors = validateDateRange({
      startDate: request.startDate,
      endDate: request.endDate,
    });

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    // Fetch order status distribution
    const distribution = await this.revenueAnalyticsService.getOrderStatusDistribution(request);

    return { distribution };
  }
}
