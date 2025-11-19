"use client"

import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import type { Order } from "@/core/domain/order"

interface RecentOrdersProps {
  orders: Order[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      shipping: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400",
      success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }
    return colors[status] || colors.pending
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Orders
        </h3>
        <Link
          href="/orders"
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          View all →
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No orders yet
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:shadow-md transition"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    #{order.id}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment.status)}`}>
                    {order.payment.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium">{order.delivery.name}</p>
                  <p className="text-xs">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(order.total)}
                </p>
                <Link
                  href="/orders"
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
