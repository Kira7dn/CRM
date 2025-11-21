"use client";

/**
 * Customer Metrics Cards Component
 *
 * Displays key customer KPIs in card format.
 */

import { CustomerMetrics } from "@/core/domain/analytics/customer-metrics";
import { Card } from "@/@shared/ui/card";
import { Users, UserPlus, UserCheck, AlertTriangle } from "lucide-react";

interface CustomerMetricsCardsProps {
  metrics: CustomerMetrics;
}

export function CustomerMetricsCards({ metrics }: CustomerMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Customers */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">Total Customers</p>
          <Users className="w-5 h-5 text-blue-500" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{metrics.totalCustomers.toLocaleString()}</p>
        </div>
      </Card>

      {/* New Customers */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">New Customers</p>
          <UserPlus className="w-5 h-5 text-green-500" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{metrics.newCustomers.toLocaleString()}</p>
          <p className="text-sm text-gray-500">In selected period</p>
        </div>
      </Card>

      {/* Returning Customers */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">Returning Customers</p>
          <UserCheck className="w-5 h-5 text-purple-500" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{metrics.returningCustomers.toLocaleString()}</p>
          <p className="text-sm text-gray-500">In selected period</p>
        </div>
      </Card>

      {/* Churn Rate */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">Churn Rate</p>
          <AlertTriangle className="w-5 h-5 text-orange-500" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{metrics.churnRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-500">No purchase in 90+ days</p>
        </div>
      </Card>
    </div>
  );
}
