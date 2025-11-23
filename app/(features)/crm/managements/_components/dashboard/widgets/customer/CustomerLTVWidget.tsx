"use client"

import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

interface CustomerLTVWidgetProps {
  avgLTV: number
}

export function CustomerLTVWidget({ avgLTV }: CustomerLTVWidgetProps) {
  return (
    <Link href="/crm/analytics/customer" className="block group">
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
        {formatCurrency(avgLTV)}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        Giá trị trọn đời mỗi KH
      </p>
    </Link>
  )
}
