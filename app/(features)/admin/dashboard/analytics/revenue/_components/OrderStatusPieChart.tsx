"use client";

/**
 * Order Status Pie Chart Component
 *
 * Visual breakdown of order statuses using a pie chart.
 */

import { OrderStatusDistribution } from "@/core/domain/analytics/revenue-metrics";
import { Card } from "@/@shared/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface OrderStatusPieChartProps {
  distribution: OrderStatusDistribution[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#8b5cf6",
  shipping: "#06b6d4",
  delivered: "#10b981",
  completed: "#22c55e",
  cancelled: "#ef4444",
  returned: "#f97316",
};

export function OrderStatusPieChart({ distribution }: OrderStatusPieChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const chartData = distribution.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    percentage: item.percentage,
    revenue: item.revenue,
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
      {distribution.length === 0 ? (
        <div className="flex items-center justify-center h-80 text-gray-500">
          No data available for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STATUS_COLORS[entry.name.toLowerCase()] || "#94a3b8"}
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
                      <p className="text-sm">Orders: {data.value}</p>
                      <p className="text-sm">Percentage: {data.percentage.toFixed(1)}%</p>
                      <p className="text-sm">Revenue: {formatCurrency(data.revenue)}</p>
                    </div>
                  </div>
                );
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
