"use client";

/**
 * Inventory Alerts Component
 * Sprint 6 - Module 1.5
 *
 * Displays products needing restock with demand predictions.
 */

import { InventoryForecast } from "@/core/domain/analytics/forecast";
import { Card } from "@/@shared/ui/card";
import { AlertTriangle, Package, TrendingUp } from "lucide-react";

interface InventoryAlertsProps {
  forecasts: InventoryForecast[];
}

export function InventoryAlerts({ forecasts }: InventoryAlertsProps) {
  // Sort by predicted demand (highest first)
  const sortedForecasts = [...forecasts].sort(
    (a, b) => b.predictedDemand - a.predictedDemand
  );

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold">Inventory Forecast</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Predicted demand for the next {forecasts[0]?.forecastPeriodDays || 7} days
      </p>

      {sortedForecasts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No inventory data available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedForecasts.slice(0, 10).map((forecast) => (
            <div
              key={forecast.productId}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{forecast.productName}</p>
                <p className="text-xs text-gray-600">
                  Product ID: {forecast.productId}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-600">Predicted Demand</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-blue-600" />
                    <p className="font-semibold text-blue-600">
                      {formatNumber(forecast.predictedDemand)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-600">Recommended Restock</p>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-orange-600" />
                    <p className="font-semibold text-orange-600">
                      {formatNumber(forecast.recommendedRestock)}
                    </p>
                  </div>
                </div>

                {forecast.currentStock !== undefined && (
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Current Stock</p>
                    <p
                      className={`font-semibold ${
                        forecast.currentStock < forecast.recommendedRestock
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatNumber(forecast.currentStock)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {sortedForecasts.length > 10 && (
        <p className="text-xs text-gray-500 text-center mt-4">
          Showing top 10 products. Total: {sortedForecasts.length} products
        </p>
      )}
    </Card>
  );
}
