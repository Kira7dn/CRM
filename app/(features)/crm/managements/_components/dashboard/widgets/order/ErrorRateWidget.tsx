"use client"

import Link from "next/link"

interface ErrorRateWidgetProps {
  errorRate: number
  cancelledOrders: number
}

export function ErrorRateWidget({
  errorRate,
  cancelledOrders,
}: ErrorRateWidgetProps) {
  return (
    <Link href="/crm/managements/orders" className="block group">
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
        {errorRate.toFixed(1)}%
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        {cancelledOrders} đơn bị hủy
      </p>
    </Link>
  )
}
