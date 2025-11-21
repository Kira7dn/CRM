"use client";

/**
 * Revenue Metrics Cards Component
 *
 * Displays key revenue KPIs in card format with trend indicators.
 */

import { RevenueMetrics } from "@/core/domain/analytics/revenue-metrics";
import { Card } from "@/@shared/ui/card";
import { ArrowUp, ArrowDown, DollarSign, ShoppingCart, TrendingUp, XCircle } from "lucide-react";

interface RevenueMetricsCardsProps {
  metrics: RevenueMetrics;
}

export function RevenueMetricsCards({ metrics }: RevenueMetricsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (changePercent?: number) => {
    if (!changePercent) return null;
    if (changePercent > 0) {
      return <ArrowUp className="w-4 h-4 text-green-500" />;
    }
    if (changePercent < 0) {
      return <ArrowDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = (changePercent?: number) => {
    if (!changePercent) return "text-gray-500";
    return changePercent > 0 ? "text-green-500" : "text-red-500";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Revenue */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">Total Revenue</p>
          <DollarSign className="w-5 h-5 text-blue-500" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
          {metrics.comparisonPeriod && (
            <div className="flex items-center gap-1">
              {getTrendIcon(metrics.comparisonPeriod.revenueChangePercent)}
              <span className={`text-sm ${getTrendColor(metrics.comparisonPeriod.revenueChangePercent)}`}>
                {formatPercentage(metrics.comparisonPeriod.revenueChangePercent)}
              </span>
              <span className="text-sm text-gray-500">vs previous period</span>
            </div>
          )}
        </div>
      </Card>

      {/* Total Orders */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">Total Orders</p>
          <ShoppingCart className="w-5 h-5 text-purple-500" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{metrics.totalOrders.toLocaleString()}</p>
          {metrics.comparisonPeriod && (
            <div className="flex items-center gap-1">
              {getTrendIcon(metrics.comparisonPeriod.ordersChangePercent)}
              <span className={`text-sm ${getTrendColor(metrics.comparisonPeriod.ordersChangePercent)}`}>
                {formatPercentage(metrics.comparisonPeriod.ordersChangePercent)}
              </span>
              <span className="text-sm text-gray-500">vs previous period</span>
            </div>
          )}
        </div>
      </Card>

      {/* Average Order Value */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">Average Order Value</p>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{formatCurrency(metrics.averageOrderValue)}</p>
          {metrics.comparisonPeriod && (
            <div className="flex items-center gap-1">
              {getTrendIcon(metrics.comparisonPeriod.aovChangePercent)}
              <span className={`text-sm ${getTrendColor(metrics.comparisonPeriod.aovChangePercent)}`}>
                {formatPercentage(metrics.comparisonPeriod.aovChangePercent)}
              </span>
              <span className="text-sm text-gray-500">vs previous period</span>
            </div>
          )}
        </div>
      </Card>

      {/* Cancel Rate */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">Cancel/Return Rate</p>
          <XCircle className="w-5 h-5 text-orange-500" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{metrics.cancelRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-500">Return: {metrics.returnRate.toFixed(1)}%</p>
        </div>
      </Card>
    </div>
  );
}
