"use client"

import Link from "next/link"

interface ReturningCustomersWidgetProps {
  returningCustomers: number
  returningRate: number
}

export function ReturningCustomersWidget({
  returningCustomers,
  returningRate,
}: ReturningCustomersWidgetProps) {
  return (
    <Link href="/crm/analytics/customer" className="block group">
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
        {returningCustomers}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        {returningRate.toFixed(1)}% tỷ lệ quay lại
      </p>
    </Link>
  )
}
