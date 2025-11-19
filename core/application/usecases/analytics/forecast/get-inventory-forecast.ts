/**
 * Get Inventory Forecast Use Case
 * Sprint 6 - Module 1.5
 *
 * Predicts product demand and recommends restock quantities.
 */

import { InventoryForecast } from "@/core/domain/analytics/forecast";
import {
  ForecastService,
  InventoryForecastPayload,
} from "@/core/application/interfaces/forecast-service";

export interface GetInventoryForecastRequest extends InventoryForecastPayload {}

export interface GetInventoryForecastResponse {
  forecasts: InventoryForecast[];
}

export class GetInventoryForecastUseCase {
  constructor(private forecastService: ForecastService) {}

  async execute(request: GetInventoryForecastRequest): Promise<GetInventoryForecastResponse> {
    // Validate input
    if (request.daysAhead <= 0) {
      throw new Error("Days ahead must be greater than 0");
    }

    if (request.daysAhead > 90) {
      throw new Error("Forecast period cannot exceed 90 days");
    }

    // Get forecasts from service
    const forecasts = await this.forecastService.getInventoryForecast(request);

    return { forecasts };
  }
}
