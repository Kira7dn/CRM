"use client"

import { useCopilotReadable } from "@copilotkit/react-core"
import { MetricCard } from "../_shared"

interface WeekOrdersWidgetProps {
  last7DaysOrderCount: number
  prev7DaysOrderCount: number
  pendingOrders: number
  completionRate: number
}

export function WeekOrdersWidget({
  last7DaysOrderCount,
  prev7DaysOrderCount,
  pendingOrders,
  completionRate,
}: WeekOrdersWidgetProps) {
  const orderChange = prev7DaysOrderCount > 0
    ? ((last7DaysOrderCount - prev7DaysOrderCount) / prev7DaysOrderCount) * 100
    : 0

  useCopilotReadable({
    description: "7-day trailing order count data",
    value: { last7DaysOrderCount, prev7DaysOrderCount, pendingOrders, completionRate }
  })

  return (
    <MetricCard
      value={last7DaysOrderCount}
      label={`đơn hàng (7 ngày) · ${pendingOrders} chờ xử lý`}
      href="/crm/managements/orders"
      trend={{ value: orderChange, label: "7 ngày" }}
    />
  )
}
