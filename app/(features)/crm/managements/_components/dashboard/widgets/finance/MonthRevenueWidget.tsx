"use client"

import { formatCurrency } from "@/lib/utils"
import { useCopilotReadable } from "@copilotkit/react-core"
import { MetricCard } from "../_shared"

interface MonthRevenueWidgetProps {
  last30DaysRevenue: number
  prev30DaysRevenue: number
  revenueChangeVsPrev30Days: number
}

export function MonthRevenueWidget({
  last30DaysRevenue,
  prev30DaysRevenue,
  revenueChangeVsPrev30Days,
}: MonthRevenueWidgetProps) {
  useCopilotReadable({
    description: "30-day trailing revenue data",
    value: { last30DaysRevenue, prev30DaysRevenue, revenueChangeVsPrev30Days }
  })

  return (
    <MetricCard
      value={formatCurrency(last30DaysRevenue)}
      label={`so với ${formatCurrency(prev30DaysRevenue)} 30 ngày trước`}
      href="/crm/analytics/revenue"
      trend={{ value: revenueChangeVsPrev30Days, label: "30 ngày" }}
    />
  )
}
