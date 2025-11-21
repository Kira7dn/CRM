"use client";

/**
 * Trend Insights Component
 * Sprint 6 - Module 1.5
 *
 * Displays automated insights about trends with visual indicators.
 */

import { TrendAnalysis } from "@/core/domain/analytics/forecast";
import { Card } from "@/@shared/ui/card";
import { TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react";

interface TrendInsightsProps {
  analyses: TrendAnalysis[];
}

export function TrendInsights({ analyses }: TrendInsightsProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case "down":
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case "stable":
        return <Minus className="w-5 h-5 text-gray-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600 bg-green-50 border-green-200";
      case "down":
        return "text-red-600 bg-red-50 border-red-200";
      case "stable":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatValue = (metric: string, value: number) => {
    if (metric === "revenue") {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value);
    }
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case "revenue":
        return "Revenue";
      case "orders":
        return "Orders";
      case "customers":
        return "New Customers";
      default:
        return metric;
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "quarter":
        return "This Quarter";
      default:
        return period;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-semibold">Trend Insights</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Automated insights based on recent performance
      </p>

      {analyses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No trend data available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getTrendIcon(analysis.trend)}
                  <div>
                    <h4 className="font-semibold">
                      {getMetricLabel(analysis.metric)} Trend
                    </h4>
                    <p className="text-xs text-gray-600">
                      {getPeriodLabel(analysis.period)}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold border ${getTrendColor(
                    analysis.trend
                  )}`}
                >
                  {analysis.trend === "up" && "+"}
                  {analysis.changePercent.toFixed(1)}%
                </span>
              </div>

              {/* Values Comparison */}
              <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600">Current Period</p>
                  <p className="text-lg font-semibold">
                    {formatValue(analysis.metric, analysis.currentValue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Previous Period</p>
                  <p className="text-lg font-semibold text-gray-600">
                    {formatValue(analysis.metric, analysis.previousValue)}
                  </p>
                </div>
              </div>

              {/* Insights */}
              <div className="space-y-2">
                {analysis.insights.map((insight, insightIdx) => (
                  <div
                    key={insightIdx}
                    className="flex items-start gap-2 text-sm"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5" />
                    <p className="text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>

              {/* Data Points Mini Chart (if available) */}
              {analysis.dataPoints && analysis.dataPoints.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-600 mb-2">Recent Activity</p>
                  <div className="flex items-end gap-1 h-12">
                    {analysis.dataPoints.slice(-10).map((point, pointIdx) => {
                      const maxValue = Math.max(
                        ...analysis.dataPoints.map((p) => p.value)
                      );
                      const height = (point.value / maxValue) * 100;

                      return (
                        <div
                          key={pointIdx}
                          className="flex-1 bg-blue-200 rounded-t hover:bg-blue-400 transition-colors"
                          style={{ height: `${height}%` }}
                          title={`${formatValue(analysis.metric, point.value)}`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
