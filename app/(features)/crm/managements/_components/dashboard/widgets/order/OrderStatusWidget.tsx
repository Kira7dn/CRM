"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@shared/ui/card"
import { memo } from "react"

interface OrderStatusWidgetProps {
  ordersByStatus: {
    pending: number
    shipping: number
    completed: number
  }
}

export const OrderStatusWidget = memo(function OrderStatusWidget({ ordersByStatus }: OrderStatusWidgetProps) {
  const total = ordersByStatus.pending + ordersByStatus.shipping + ordersByStatus.completed

  const statusData = [
    {
      label: "Pending",
      count: ordersByStatus.pending,
      percentage: total > 0 ? ((ordersByStatus.pending / total) * 100).toFixed(1) : "0",
      color: "bg-yellow-500",
    },
    {
      label: "Shipping",
      count: ordersByStatus.shipping,
      percentage: total > 0 ? ((ordersByStatus.shipping / total) * 100).toFixed(1) : "0",
      color: "bg-blue-500",
    },
    {
      label: "Completed",
      count: ordersByStatus.completed,
      percentage: total > 0 ? ((ordersByStatus.completed / total) * 100).toFixed(1) : "0",
      color: "bg-green-500",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Orders by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {statusData.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`${item.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
})
