"use client"

import Link from "next/link"

interface ChurnRiskWidgetProps {
  churnRiskCustomers: number
  churnRiskRate: number
}

export function ChurnRiskWidget({
  churnRiskCustomers,
  churnRiskRate,
}: ChurnRiskWidgetProps) {
  return (
    <Link href="/crm/analytics/customer" className="block group">
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
        {churnRiskCustomers}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        {churnRiskRate.toFixed(1)}% khách hàng
      </p>
    </Link>
  )
}
