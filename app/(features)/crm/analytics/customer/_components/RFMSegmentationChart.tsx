"use client";

/**
 * RFM Segmentation Chart Component
 *
 * Bar chart showing customer distribution by RFM segment.
 */

import { RFMSegment } from "@/core/domain/analytics/customer-metrics";
import { Card } from "@/@shared/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface RFMSegmentationChartProps {
  segments: RFMSegment[];
}

export function RFMSegmentationChart({ segments }: RFMSegmentationChartProps) {
  // Count customers by segment
  const segmentCounts = segments.reduce((acc, seg) => {
    acc[seg.segment] = (acc[seg.segment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(segmentCounts).map(([segment, count]) => ({
    segment,
    count,
  })).sort((a, b) => b.count - a.count);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">RFM Segmentation</h3>
      <p className="text-sm text-gray-600 mb-4">
        Customer segmentation based on Recency, Frequency, and Monetary value
      </p>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-80 text-gray-500">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis
              dataKey="segment"
              className="text-sm"
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis className="text-sm" tick={{ fontSize: 12 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                    <p className="font-semibold mb-1">{payload[0].payload.segment}</p>
                    <p className="text-sm">Customers: {payload[0].payload.count}</p>
                  </div>
                );
              }}
            />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" name="Customers" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
