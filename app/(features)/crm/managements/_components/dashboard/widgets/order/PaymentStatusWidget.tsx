"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@shared/ui/card"
import { memo } from "react"

interface PaymentStatusWidgetProps {
  ordersByPayment: {
    pending: number
    success: number
    failed: number
  }
}

export const PaymentStatusWidget = memo(function PaymentStatusWidget({ ordersByPayment }: PaymentStatusWidgetProps) {
  const total = ordersByPayment.pending + ordersByPayment.success + ordersByPayment.failed

  const paymentData = [
    {
      label: "Pending",
      count: ordersByPayment.pending,
      percentage: total > 0 ? ((ordersByPayment.pending / total) * 100).toFixed(1) : "0",
      color: "bg-gray-500",
    },
    {
      label: "Success",
      count: ordersByPayment.success,
      percentage: total > 0 ? ((ordersByPayment.success / total) * 100).toFixed(1) : "0",
      color: "bg-green-500",
    },
    {
      label: "Failed",
      count: ordersByPayment.failed,
      percentage: total > 0 ? ((ordersByPayment.failed / total) * 100).toFixed(1) : "0",
      color: "bg-red-500",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Payment Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {paymentData.map((item) => (
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
