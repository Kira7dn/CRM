"use client"

import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useCopilotReadable } from "@copilotkit/react-core"

interface MonthRevenueWidgetProps {
  thisMonthRevenue: number
  lastMonthRevenue: number
  revenueChangeVsLastMonth: number
}

export function MonthRevenueWidget({
  thisMonthRevenue,
  lastMonthRevenue,
  revenueChangeVsLastMonth,
}: MonthRevenueWidgetProps) {
  const formatChangeValue = (value: number) => {
    const formatted = Math.abs(value).toFixed(1)
    const sign = value >= 0 ? "+" : "-"
    return `${sign}${formatted}%`
  }

  const getChangeColor = (value: number) => {
    if (value >= 0) return "text-green-600 dark:text-green-400"
    return "text-red-600 dark:text-red-400"
  }
  // Make data available to the CopilotKit
  useCopilotReadable({
    description: "Dashboard data including this thisMonthRevenue,lastMonthRevenue,revenueChangeVsLastMonth",
    value: {
      thisMonthRevenue,
      lastMonthRevenue,
      revenueChangeVsLastMonth
    }
  })
  return (
    <Link href="/crm/analytics/revenue" className="block group">
      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center gap-1 text-xs font-semibold ${getChangeColor(revenueChangeVsLastMonth)}`}>
          {revenueChangeVsLastMonth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{formatChangeValue(revenueChangeVsLastMonth)}</span>
        </div>
      </div>
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
        {formatCurrency(thisMonthRevenue)}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        so với {formatCurrency(lastMonthRevenue)} tháng trước
      </p>
    </Link>
  )
}
