"use client"

import { formatCurrency } from "@/lib/utils"

interface StaffPerformance {
  staffId: string
  orderCount: number
  revenue: number
  avgProcessingTime: number
}

interface TopStaffWidgetProps {
  topPerformingStaff: StaffPerformance[]
}

export function TopStaffWidget({ topPerformingStaff }: TopStaffWidgetProps) {
  if (topPerformingStaff.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {topPerformingStaff.slice(0, 3).map((staff, idx) => (
        <div
          key={staff.staffId}
          className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
        >
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center text-xs font-bold text-green-700 dark:text-green-300">
                #{idx + 1}
              </div>
              <div className="font-medium text-xs text-gray-900 dark:text-white">
                Staff {staff.staffId}
              </div>
            </div>
          </div>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Doanh thu:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(staff.revenue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Đơn hàng:</span>
              <span className="font-semibold">{staff.orderCount}</span>
            </div>
            {staff.avgProcessingTime > 0 && (
              <div className="flex justify-between">
                <span>TG TB:</span>
                <span className="font-semibold">{staff.avgProcessingTime.toFixed(1)}h</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
