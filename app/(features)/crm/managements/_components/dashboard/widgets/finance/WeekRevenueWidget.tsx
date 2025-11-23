"use client"

import { formatCurrency } from "@/lib/utils"
import { useCopilotReadable } from "@copilotkit/react-core"
import { MetricCard } from "../_shared"

interface WeekRevenueWidgetProps {
  last7DaysRevenue: number
  prev7DaysRevenue: number
  revenueChangeVsPrev7Days: number
}

export function WeekRevenueWidget({
  last7DaysRevenue,
  prev7DaysRevenue,
  revenueChangeVsPrev7Days,
}: WeekRevenueWidgetProps) {
  useCopilotReadable({
    description: "7-day trailing revenue data",
    value: { last7DaysRevenue, prev7DaysRevenue, revenueChangeVsPrev7Days }
  })

  return (
    <MetricCard
      value={formatCurrency(last7DaysRevenue)}
      label={`so với ${formatCurrency(prev7DaysRevenue)} 7 ngày trước`}
      href="/crm/analytics/revenue"
      trend={{ value: revenueChangeVsPrev7Days, label: "7 ngày" }}
    />
  )
}
