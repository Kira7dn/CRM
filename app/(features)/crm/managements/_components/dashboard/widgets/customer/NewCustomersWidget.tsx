"use client"

import Link from "next/link"

interface NewCustomersWidgetProps {
  todayNewCustomers: number
  totalCustomers: number
  returningRate: number
}

export function NewCustomersWidget({
  todayNewCustomers,
  totalCustomers,
  returningRate,
}: NewCustomersWidgetProps) {
  return (
    <Link href="/crm/analytics/customer" className="block group">
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
        {todayNewCustomers}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        {totalCustomers.toLocaleString()} tổng, {returningRate.toFixed(1)}% quay lại
      </p>
    </Link>
  )
}
