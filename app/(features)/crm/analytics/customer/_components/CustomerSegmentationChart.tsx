"use client";

/**
 * Customer Segmentation Chart Component
 *
 * Pie chart showing customer distribution by tier.
 */

import { CustomerSegmentStats } from "@/core/domain/analytics/customer-metrics";
import { Card } from "@/@shared/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface CustomerSegmentationChartProps {
  segments: CustomerSegmentStats[];
}

const TIER_COLORS: Record<string, string> = {
  new: "#94a3b8",
  regular: "#3b82f6",
  vip: "#f59e0b",
  premium: "#a855f7",
};

const TIER_LABELS: Record<string, string> = {
  new: "New",
  regular: "Regular",
  vip: "VIP",
  premium: "Premium",
};

export function CustomerSegmentationChart({ segments }: CustomerSegmentationChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const chartData = segments.map((segment) => ({
    name: TIER_LABELS[segment.tier] || segment.tier,
    value: segment.count,
    percentage: segment.percentage,
    avgRevenue: segment.averageRevenue,
    avgFrequency: segment.averageOrderFrequency,
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Customer Segmentation by Tier</h3>
      {segments.length === 0 ? (
        <div className="flex items-center justify-center h-80 text-gray-500">
          No data available
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, payload }) => `${name}: ${payload.percentage.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={TIER_COLORS[segments[index].tier] || "#94a3b8"}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                      <p className="font-semibold mb-2">{data.name}</p>
                      <div className="space-y-1">
                        <p className="text-sm">Customers: {data.value}</p>
                        <p className="text-sm">Percentage: {data.percentage.toFixed(1)}%</p>
                        <p className="text-sm">Avg Revenue: {formatCurrency(data.avgRevenue)}</p>
                        <p className="text-sm">Avg Orders: {data.avgFrequency.toFixed(1)}</p>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          {/* Segment Stats Table */}
          <div className="mt-6 space-y-2">
            {segments.map((segment) => (
              <div
                key={segment.tier}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: TIER_COLORS[segment.tier] }}
                  />
                  <span className="font-medium">{TIER_LABELS[segment.tier]}</span>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="text-right">
                    <p className="text-gray-600">Count</p>
                    <p className="font-semibold">{segment.count}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Avg Revenue</p>
                    <p className="font-semibold">{formatCurrency(segment.averageRevenue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Avg Orders</p>
                    <p className="font-semibold">{segment.averageOrderFrequency.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
