"use client";

/**
 * Revenue Forecast Chart Component
 * Sprint 6 - Module 1.5
 *
 * Line chart showing predicted revenue with confidence intervals.
 */

import { RevenueForecast } from "@/core/domain/analytics/forecast";
import { Card } from "@/@shared/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { format } from "date-fns";

interface RevenueForecastChartProps {
  forecasts: RevenueForecast[];
}

export function RevenueForecastChart({ forecasts }: RevenueForecastChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const chartData = forecasts.map((forecast) => ({
    date: format(new Date(forecast.forecastDate), "MMM dd"),
    predicted: forecast.predictedRevenue,
    lower: forecast.confidenceInterval.lower,
    upper: forecast.confidenceInterval.upper,
    actual: forecast.actualRevenue,
  }));

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">Revenue Forecast</h3>
          <p className="text-sm text-gray-600">
            Predicted revenue for the next {forecasts.length} days
          </p>
        </div>
        <div className="text-sm text-gray-500">
          95% Confidence Interval
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
          <XAxis
            dataKey="date"
            className="text-sm"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            className="text-sm"
            tick={{ fontSize: 12 }}
            tickFormatter={formatCurrency}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              return (
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                  <p className="font-semibold mb-2">{payload[0].payload.date}</p>
                  <div className="space-y-1">
                    <p className="text-sm text-blue-600">
                      Predicted: {formatCurrency(payload[0].payload.predicted)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Range: {formatCurrency(payload[0].payload.lower)} -{" "}
                      {formatCurrency(payload[0].payload.upper)}
                    </p>
                    {payload[0].payload.actual && (
                      <p className="text-sm text-green-600">
                        Actual: {formatCurrency(payload[0].payload.actual)}
                      </p>
                    )}
                  </div>
                </div>
              );
            }}
          />
          <Legend />

          {/* Confidence interval area */}
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="#93c5fd"
            fillOpacity={0.3}
            name="Upper Bound"
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="#ffffff"
            fillOpacity={1}
            name="Lower Bound"
          />

          {/* Predicted revenue line */}
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", r: 4 }}
            name="Predicted Revenue"
          />

          {/* Actual revenue line (if available) */}
          {chartData.some(d => d.actual) && (
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "#10b981", r: 4 }}
              name="Actual Revenue"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t">
        <div>
          <p className="text-xs text-gray-600">Avg Daily Forecast</p>
          <p className="text-lg font-semibold">
            {formatCurrency(
              forecasts.reduce((sum, f) => sum + f.predictedRevenue, 0) / forecasts.length
            )}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Total Predicted</p>
          <p className="text-lg font-semibold">
            {formatCurrency(
              forecasts.reduce((sum, f) => sum + f.predictedRevenue, 0)
            )}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Model</p>
          <p className="text-lg font-semibold">Linear Regression</p>
        </div>
      </div>
    </Card>
  );
}
