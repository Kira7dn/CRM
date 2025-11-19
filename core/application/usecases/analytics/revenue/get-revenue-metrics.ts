/**
 * Get Revenue Metrics Use Case
 *
 * Retrieves core revenue KPIs for a given period with optional comparison.
 */

import {
  RevenueMetrics,
  validateDateRange,
} from "@/core/domain/analytics/revenue-metrics";
import {
  RevenueAnalyticsService,
  RevenueMetricsQuery,
} from "@/core/application/interfaces/analytics/revenue-analytics-service";

export interface GetRevenueMetricsRequest extends RevenueMetricsQuery {}

export interface GetRevenueMetricsResponse {
  metrics: RevenueMetrics;
}

export class GetRevenueMetricsUseCase {
  constructor(private revenueAnalyticsService: RevenueAnalyticsService) {}

  async execute(request: GetRevenueMetricsRequest): Promise<GetRevenueMetricsResponse> {
    // Validate date range if provided
    if (request.startDate && request.endDate) {
      const errors = validateDateRange({
        startDate: request.startDate,
        endDate: request.endDate,
      });

      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(", ")}`);
      }
    }

    // Validate comparison period if provided
    if (request.comparisonStartDate && request.comparisonEndDate) {
      const comparisonErrors = validateDateRange({
        startDate: request.comparisonStartDate,
        endDate: request.comparisonEndDate,
      });

      if (comparisonErrors.length > 0) {
        throw new Error(`Comparison period validation failed: ${comparisonErrors.join(", ")}`);
      }
    }

    // Fetch metrics from service
    const metrics = await this.revenueAnalyticsService.getRevenueMetrics(request);

    return { metrics };
  }
}
