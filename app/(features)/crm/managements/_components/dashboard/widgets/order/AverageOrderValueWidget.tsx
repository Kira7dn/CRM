"use client"

import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

interface AverageOrderValueWidgetProps {
  aov: number
  totalOrders: number
}

export function AverageOrderValueWidget({
  aov,
  totalOrders,
}: AverageOrderValueWidgetProps) {
  return (
    <Link href="/crm/analytics/revenue" className="block group">
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
        {formatCurrency(aov)}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        {totalOrders} tổng đơn
      </p>
    </Link>
  )
}
