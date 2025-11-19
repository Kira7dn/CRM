/**
 * Get Trend Analysis Use Case
 * Sprint 6 - Module 1.5
 *
 * Analyzes trends for revenue, orders, or customers over time periods.
 */

import { TrendAnalysis } from "@/core/domain/analytics/forecast";
import {
  ForecastService,
  TrendAnalysisPayload,
} from "@/core/application/interfaces/forecast-service";

export interface GetTrendAnalysisRequest extends TrendAnalysisPayload {}

export interface GetTrendAnalysisResponse {
  analysis: TrendAnalysis;
}

export class GetTrendAnalysisUseCase {
  constructor(private forecastService: ForecastService) {}

  async execute(request: GetTrendAnalysisRequest): Promise<GetTrendAnalysisResponse> {
    // Validate input
    if (!["revenue", "orders", "customers"].includes(request.metric)) {
      throw new Error("Metric must be one of: revenue, orders, customers");
    }

    if (!["week", "month", "quarter"].includes(request.period)) {
      throw new Error("Period must be one of: week, month, quarter");
    }

    // Get trend analysis from service
    const analysis = await this.forecastService.getTrendAnalysis(request);

    return { analysis };
  }
}
