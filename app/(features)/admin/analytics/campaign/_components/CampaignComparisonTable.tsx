"use client";

/**
 * Campaign Comparison Table Component
 *
 * Displays side-by-side comparison of multiple campaigns.
 */

import type { CampaignAnalytics } from "@/core/domain/analytics/campaign-performance";
import { Card } from "@/@shared/ui/card";
import { formatROI, getPerformanceTier } from "@/core/domain/analytics/campaign-performance";
import { TrendingUp, TrendingDown, Trophy, Target } from "lucide-react";

interface CampaignComparisonTableProps {
  campaigns: CampaignAnalytics[];
}

export function CampaignComparisonTable({ campaigns }: CampaignComparisonTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const getTierColor = (tier: string) => {
    const colors = {
      excellent: "text-green-600 bg-green-100",
      good: "text-blue-600 bg-blue-100",
      average: "text-yellow-600 bg-yellow-100",
      poor: "text-red-600 bg-red-100",
    };
    return colors[tier as keyof typeof colors] || colors.average;
  };

  const getTopPerformer = (metric: keyof CampaignAnalytics) => {
    if (campaigns.length === 0) return null;
    return campaigns.reduce((top, campaign) => {
      const topValue = typeof top[metric] === "number" ? (top[metric] as number) : 0;
      const campaignValue = typeof campaign[metric] === "number" ? (campaign[metric] as number) : 0;
      return campaignValue > topValue ? campaign : top;
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Campaign Comparison</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Trophy className="w-4 h-4" />
          <span>Top performers highlighted</span>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No campaigns to compare</p>
          <p className="text-sm mt-1">Select campaigns to see comparison</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Campaign
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Revenue
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Spend
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  ROI
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Orders
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  CTR
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Conv. Rate
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => {
                const isTopRevenue = getTopPerformer("totalRevenue")?.campaignId === campaign.campaignId;
                const isTopROI = getTopPerformer("roi")?.campaignId === campaign.campaignId;
                const performanceTier = getPerformanceTier(campaign.roi);

                return (
                  <tr
                    key={campaign.campaignId}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {isTopRevenue && (
                          <Trophy className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="font-medium text-gray-900">{campaign.campaignName}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {campaign.platformBreakdown.map((p) => p.platform).join(", ")}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(campaign.totalRevenue)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right text-gray-700">
                      {campaign.totalSpend ? formatCurrency(campaign.totalSpend) : "-"}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {isTopROI && <Trophy className="w-3 h-3 text-yellow-500" />}
                        <span
                          className={`font-semibold ${campaign.roi >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                        >
                          {formatROI(campaign.roi)}
                        </span>
                        {campaign.roi >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right text-gray-700">
                      {formatNumber(campaign.totalOrders)}
                    </td>

                    <td className="py-3 px-4 text-right text-gray-700">
                      {campaign.metrics.ctr.toFixed(2)}%
                    </td>

                    <td className="py-3 px-4 text-right text-gray-700">
                      {campaign.metrics.conversionRate.toFixed(2)}%
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(
                          performanceTier
                        )}`}
                      >
                        {performanceTier}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
