"use client"

import Link from "next/link"

interface LateOrdersWidgetProps {
  lateOrders: number
}

export function LateOrdersWidget({ lateOrders }: LateOrdersWidgetProps) {
  const isHighRisk = lateOrders > 0

  return (
    <Link href="/crm/managements/orders" className="block group">
      <p className={`text-xl font-bold mt-0.5 ${isHighRisk ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
        {lateOrders}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        Quá thời gian giao hàng
      </p>
    </Link>
  )
}
