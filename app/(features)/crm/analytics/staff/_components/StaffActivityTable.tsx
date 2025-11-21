"use client";

/**
 * Staff Activity Table Component
 *
 * Displays daily staff activity logs.
 */

import { StaffActivity } from "@/core/domain/analytics/staff-performance";
import { Card } from "@/@shared/ui/card";
import { format } from "date-fns";

interface StaffActivityTableProps {
  activities: StaffActivity[];
}

export function StaffActivityTable({ activities }: StaffActivityTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Staff Activity Log</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Date</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Staff</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Processed</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Completed</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Cancelled</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No activity data available
                </td>
              </tr>
            ) : (
              activities.map((activity, index) => (
                <tr key={`${activity.staffId}-${activity.date.toISOString()}`} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 text-sm">
                    {format(new Date(activity.date), "MMM dd, yyyy")}
                  </td>
                  <td className="py-3 px-2">
                    <p className="font-medium text-gray-900">{activity.staffName}</p>
                  </td>
                  <td className="py-3 px-2 text-right text-gray-700">
                    {activity.ordersProcessed}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className="text-green-600 font-semibold">
                      {activity.ordersCompleted}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className="text-red-600">
                      {activity.ordersCancelled}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-semibold text-gray-900">
                    {formatCurrency(activity.totalRevenue)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
