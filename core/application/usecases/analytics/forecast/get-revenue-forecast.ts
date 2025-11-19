/**
 * Get Revenue Forecast Use Case
 * Sprint 6 - Module 1.5
 *
 * Generates revenue predictions for future periods using statistical models.
 */

import { RevenueForecast } from "@/core/domain/analytics/forecast";
import {
  ForecastService,
  RevenueForecastPayload,
} from "@/core/application/interfaces/forecast-service";

export interface GetRevenueForecastRequest extends RevenueForecastPayload {}

export interface GetRevenueForecastResponse {
  forecasts: RevenueForecast[];
}

export class GetRevenueForecastUseCase {
  constructor(private forecastService: ForecastService) {}

  async execute(request: GetRevenueForecastRequest): Promise<GetRevenueForecastResponse> {
    // Validate input
    if (request.daysAhead <= 0) {
      throw new Error("Days ahead must be greater than 0");
    }

    if (request.daysAhead > 90) {
      throw new Error("Forecast period cannot exceed 90 days");
    }

    // Get forecasts from service
    const forecasts = await this.forecastService.getRevenueForecast(request);

    return { forecasts };
  }
}
