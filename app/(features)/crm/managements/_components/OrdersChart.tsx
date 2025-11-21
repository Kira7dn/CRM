"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@shared/ui/card"

interface OrdersChartProps {
  ordersByStatus: {
    pending: number
    shipping: number
    completed: number
  }
  ordersByPayment: {
    pending: number
    success: number
    failed: number
  }
}

export function OrdersChart({ ordersByStatus, ordersByPayment }: OrdersChartProps) {
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

  const paymentTotal = ordersByPayment.pending + ordersByPayment.success + ordersByPayment.failed
  const paymentData = [
    {
      label: "Pending",
      count: ordersByPayment.pending,
      percentage: paymentTotal > 0 ? ((ordersByPayment.pending / paymentTotal) * 100).toFixed(1) : "0",
      color: "bg-gray-500",
    },
    {
      label: "Success",
      count: ordersByPayment.success,
      percentage: paymentTotal > 0 ? ((ordersByPayment.success / paymentTotal) * 100).toFixed(1) : "0",
      color: "bg-green-500",
    },
    {
      label: "Failed",
      count: ordersByPayment.failed,
      percentage: paymentTotal > 0 ? ((ordersByPayment.failed / paymentTotal) * 100).toFixed(1) : "0",
      color: "bg-red-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Order Status Chart */}
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

      {/* Payment Status Chart */}
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
    </div>
  )
}
