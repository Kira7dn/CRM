/**
 * Get Revenue Time Series Use Case
 *
 * Retrieves revenue trend data over time with specified granularity.
 */

import {
  RevenueTimeSeries,
  validateDateRange,
  validateTimeGranularity,
} from "@/core/domain/analytics/revenue-metrics";
import {
  RevenueAnalyticsService,
  RevenueTimeSeriesQuery,
} from "@/core/application/interfaces/analytics/revenue-analytics-service";

export interface GetRevenueTimeSeriesRequest extends RevenueTimeSeriesQuery {}

export interface GetRevenueTimeSeriesResponse {
  timeSeries: RevenueTimeSeries[];
}

export class GetRevenueTimeSeriesUseCase {
  constructor(private revenueAnalyticsService: RevenueAnalyticsService) {}

  async execute(request: GetRevenueTimeSeriesRequest): Promise<GetRevenueTimeSeriesResponse> {
    // Validate date range
    const errors = validateDateRange({
      startDate: request.startDate,
      endDate: request.endDate,
    });

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    // Validate granularity
    if (!validateTimeGranularity(request.granularity)) {
      throw new Error(`Invalid granularity: ${request.granularity}. Must be one of: day, week, month, quarter, year`);
    }

    // Fetch time series data
    const timeSeries = await this.revenueAnalyticsService.getRevenueTimeSeries(request);

    return { timeSeries };
  }
}
