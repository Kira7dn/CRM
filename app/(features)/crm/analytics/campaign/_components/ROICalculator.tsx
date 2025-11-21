"use client";

/**
 * ROI Calculator Component
 *
 * Interactive ROI calculator and metrics cards.
 */

import type { CampaignAnalytics } from "@/core/domain/analytics/campaign-performance";
import { Card } from "@/@shared/ui/card";
import { DollarSign, TrendingUp, ShoppingCart, Target } from "lucide-react";

interface ROICalculatorProps {
  analytics: CampaignAnalytics;
}

export function ROICalculator({ analytics }: ROICalculatorProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const metrics = [
    {
      label: "Total Revenue",
      value: formatCurrency(analytics.totalRevenue),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Total Spend",
      value: analytics.totalSpend ? formatCurrency(analytics.totalSpend) : "Not Set",
      icon: Target,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      label: "Net Profit",
      value: formatCurrency(analytics.netProfit),
      icon: TrendingUp,
      color: analytics.netProfit >= 0 ? "text-emerald-600" : "text-red-600",
      bgColor: analytics.netProfit >= 0 ? "bg-emerald-100" : "bg-red-100",
    },
    {
      label: "Total Orders",
      value: analytics.totalOrders.toString(),
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`w-4 h-4 ${metric.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
            </Card>
          );
        })}
      </div>

      {/* ROI Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Return on Investment (ROI)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {analytics.totalSpend
                ? `For every ₫1 spent, you earned ₫${(
                    analytics.totalRevenue / analytics.totalSpend
                  ).toFixed(2)}`
                : "Set campaign spend to calculate ROI"}
            </p>
          </div>
          <div className="text-right">
            <div
              className={`text-4xl font-bold ${
                analytics.roi >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatPercent(analytics.roi)}
            </div>
            <div className="text-sm text-gray-500 mt-1">ROI</div>
          </div>
        </div>

        {/* ROI Breakdown */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600 mb-1">Cost per Order</p>
              <p className="text-lg font-semibold text-gray-900">
                {analytics.metrics.costPerAcquisition
                  ? formatCurrency(analytics.metrics.costPerAcquisition)
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Avg Order Value</p>
              <p className="text-lg font-semibold text-gray-900">
                {analytics.totalOrders > 0
                  ? formatCurrency(analytics.totalRevenue / analytics.totalOrders)
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Conversion Rate</p>
              <p className="text-lg font-semibold text-gray-900">
                {analytics.metrics.conversionRate.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
