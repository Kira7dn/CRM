"use client";

/**
 * Churn Risk List Component
 * Sprint 6 - Module 1.5
 *
 * Displays at-risk customers with recommended actions.
 */

import { ChurnPrediction } from "@/core/domain/analytics/forecast";
import { Card } from "@/@shared/ui/card";
import { AlertCircle, TrendingDown, Calendar, DollarSign, ShoppingBag } from "lucide-react";

interface ChurnRiskListProps {
  predictions: ChurnPrediction[];
}

export function ChurnRiskList({ predictions }: ChurnRiskListProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  // Sort by churn probability (highest first)
  const sortedPredictions = [...predictions].sort(
    (a, b) => b.churnProbability - a.churnProbability
  );

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-semibold">Customer Churn Risk</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Customers at risk of churning based on RFM analysis
      </p>

      {/* Risk Level Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {["high", "medium", "low"].map((level) => {
          const count = predictions.filter((p) => p.riskLevel === level).length;
          return (
            <div
              key={level}
              className={`p-3 rounded-lg border ${getRiskColor(level)}`}
            >
              <p className="text-xs font-medium uppercase mb-1">{level} Risk</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          );
        })}
      </div>

      {sortedPredictions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No churn predictions available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPredictions.slice(0, 15).map((prediction) => (
            <div
              key={prediction.customerId}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="font-semibold">{prediction.customerName}</p>
                  <p className="text-xs text-gray-600">
                    ID: {prediction.customerId}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Churn Probability</p>
                    <p className="text-xl font-bold text-red-600">
                      {(prediction.churnProbability * 100).toFixed(0)}%
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(
                      prediction.riskLevel
                    )}`}
                  >
                    {prediction.riskLevel.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-600">Last Order</p>
                    <p className="text-sm font-medium">
                      {prediction.daysSinceLastOrder} days ago
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-600">Total Orders</p>
                    <p className="text-sm font-medium">{prediction.totalOrders}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-600">Total Revenue</p>
                    <p className="text-sm font-medium">
                      {prediction.totalRevenue
                        ? formatCurrency(prediction.totalRevenue)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Factors */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Risk Factors:
                </p>
                <div className="flex flex-wrap gap-2">
                  {prediction.factors.map((factor, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-200"
                    >
                      <TrendingDown className="w-3 h-3 inline mr-1" />
                      {factor}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Action */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-800 mb-1">
                  Recommended Action:
                </p>
                <p className="text-sm text-blue-700">
                  {prediction.recommendedAction}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {sortedPredictions.length > 15 && (
        <p className="text-xs text-gray-500 text-center mt-4">
          Showing top 15 at-risk customers. Total: {sortedPredictions.length}{" "}
          customers
        </p>
      )}
    </Card>
  );
}
