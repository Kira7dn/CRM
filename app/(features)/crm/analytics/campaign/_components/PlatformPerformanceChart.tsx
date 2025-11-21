"use client";

/**
 * Platform Performance Chart Component
 *
 * Displays platform breakdown with bar charts.
 */

import type { PlatformBreakdown } from "@/core/domain/analytics/campaign-performance";
import { Card } from "@/@shared/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getPlatformName } from "@/core/domain/analytics/campaign-performance";

interface PlatformPerformanceChartProps {
  platformBreakdown: PlatformBreakdown[];
}

export function PlatformPerformanceChart({ platformBreakdown }: PlatformPerformanceChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      compactDisplay: "short",
    }).format(value);
  };

  const chartData = platformBreakdown.map((platform) => ({
    name: getPlatformName(platform.platform),
    Revenue: platform.revenue,
    Orders: platform.orders,
    Clicks: platform.clicks,
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Platform Performance Breakdown</h3>

      {platformBreakdown.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No platform data available</p>
          <p className="text-sm mt-1">Orders must have UTM source parameters</p>
        </div>
      ) : (
        <>
          {/* Revenue by Platform Chart */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Revenue by Platform</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="Revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Details Table */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Platform Details</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-600">
                      Platform
                    </th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-gray-600">
                      Revenue
                    </th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-gray-600">
                      Orders
                    </th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-gray-600">
                      Clicks
                    </th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-gray-600">
                      CTR
                    </th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-gray-600">
                      Conv. Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {platformBreakdown.map((platform) => (
                    <tr
                      key={platform.platform}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-2 px-3 font-medium text-gray-900">
                        {getPlatformName(platform.platform)}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-700">
                        {formatCurrency(platform.revenue)}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-700">
                        {platform.orders.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-700">
                        {platform.clicks.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-700">
                        {platform.ctr.toFixed(2)}%
                      </td>
                      <td className="py-2 px-3 text-right text-gray-700">
                        {platform.conversionRate.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
