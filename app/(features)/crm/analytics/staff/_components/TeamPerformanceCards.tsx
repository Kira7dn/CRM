"use client";

/**
 * Team Performance Cards Component
 *
 * Displays team-level KPIs.
 */

import { TeamPerformance } from "@/core/domain/analytics/staff-performance";
import { Card } from "@/@shared/ui/card";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";

interface TeamPerformanceCardsProps {
  team: TeamPerformance;
}

export function TeamPerformanceCards({ team }: TeamPerformanceCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Revenue */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">Total Revenue</p>
          <DollarSign className="w-5 h-5 text-green-500" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{formatCurrency(team.totalRevenue)}</p>
          <p className="text-sm text-gray-500">Team Performance</p>
        </div>
      </Card>

      {/* Total Orders */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">Total Orders</p>
          <ShoppingCart className="w-5 h-5 text-blue-500" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{team.totalOrders.toLocaleString()}</p>
          <p className="text-sm text-gray-500">All Staff</p>
        </div>
      </Card>

      {/* Active Staff */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">Active Staff</p>
          <Users className="w-5 h-5 text-purple-500" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{team.staffCount}</p>
          <p className="text-sm text-gray-500">Team Members</p>
        </div>
      </Card>

      {/* Avg Revenue per Staff */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">Avg per Staff</p>
          <TrendingUp className="w-5 h-5 text-orange-500" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">
            {formatCurrency(team.averageMetrics.revenuePerStaff)}
          </p>
          <p className="text-sm text-gray-500">
            {team.averageMetrics.ordersPerStaff.toFixed(1)} orders/staff
          </p>
        </div>
      </Card>
    </div>
  );
}
