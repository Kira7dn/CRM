"use client";

/**
 * Staff Leaderboard Component
 *
 * Displays staff ranking with medals and performance tiers.
 */

import { StaffRanking } from "@/core/domain/analytics/staff-performance";
import { Card } from "@/@shared/ui/card";
import { Trophy, Medal, Award } from "lucide-react";

interface StaffLeaderboardProps {
  rankings: StaffRanking[];
}

export function StaffLeaderboard({ rankings }: StaffLeaderboardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-linear-to-r from-yellow-50 to-yellow-100 border-yellow-300";
      case 2:
        return "bg-linear-to-r from-gray-50 to-gray-100 border-gray-300";
      case 3:
        return "bg-linear-to-r from-orange-50 to-orange-100 border-orange-300";
      default:
        return "bg-white";
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Staff Leaderboard</h3>
      <div className="space-y-3">
        {rankings.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            No staff data available for this period
          </p>
        ) : (
          rankings.map((staff) => (
            <div
              key={staff.staffId}
              className={`p-4 rounded-lg border transition-all hover:shadow-md ${getRankBg(staff.rank)}`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="shrink-0 w-12 text-center">
                  {getRankIcon(staff.rank)}
                </div>

                {/* Staff Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{staff.staffName}</h4>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {staff.role}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex gap-6 text-sm">
                  <div className="text-right">
                    <p className="text-gray-600">Revenue</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(staff.totalRevenue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Orders</p>
                    <p className="font-semibold text-gray-900">{staff.totalOrders}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">AOV</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(staff.averageOrderValue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Completion</p>
                    <p className="font-semibold text-green-600">
                      {staff.completionRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
