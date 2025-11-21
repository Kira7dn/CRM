"use client";

/**
 * Revenue Time Series Chart Component
 *
 * Line chart showing revenue trends over time using Recharts.
 */

import { RevenueTimeSeries } from "@/core/domain/analytics/revenue-metrics";
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
} from "recharts";
import { format } from "date-fns";

interface RevenueTimeSeriesChartProps {
  data: RevenueTimeSeries[];
  granularity: "day" | "week" | "month" | "quarter" | "year";
}

export function RevenueTimeSeriesChart({ data, granularity }: RevenueTimeSeriesChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    switch (granularity) {
      case "day":
        return format(new Date(date), "MMM dd");
      case "week":
        return format(new Date(date), "MMM dd");
      case "month":
        return format(new Date(date), "MMM yyyy");
      case "quarter":
        return format(new Date(date), "QQQ yyyy");
      case "year":
        return format(new Date(date), "yyyy");
      default:
        return format(new Date(date), "MMM dd");
    }
  };

  const chartData = data.map((item) => ({
    date: formatDate(item.date),
    revenue: item.revenue,
    orders: item.orderCount,
    aov: item.averageOrderValue,
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
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
                      Revenue: {formatCurrency(payload[0].payload.revenue)}
                    </p>
                    <p className="text-sm text-purple-600">
                      Orders: {payload[0].payload.orders}
                    </p>
                    <p className="text-sm text-green-600">
                      AOV: {formatCurrency(payload[0].payload.aov)}
                    </p>
                  </div>
                </div>
              );
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Revenue"
          />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="#a855f7"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Orders"
            yAxisId={0}
            hide
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
