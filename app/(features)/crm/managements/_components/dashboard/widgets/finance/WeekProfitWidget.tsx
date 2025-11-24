"use client"

import { formatCurrency } from "@/lib/utils"
import { useCopilotReadable } from "@copilotkit/react-core"

interface ProfitMetrics {
  revenue: number
  cogs: number
  grossProfit: number
  grossMargin: number
  operationalCosts: number
  netProfit: number
  netMargin: number
}

export function WeekProfitWidget({
  revenue,
  cogs,
  grossProfit,
  grossMargin,
  operationalCosts,
  netProfit,
  netMargin,
}: ProfitMetrics) {

  // Make data available to CopilotKit (must be before early returns)
  useCopilotReadable({
    description: "7-day trailing profit metrics including revenue, COGS, gross profit, gross margin, operational costs, net profit, and net margin",
    value: {
      revenue,
      cogs,
      grossProfit,
      grossMargin,
      operationalCosts,
      netProfit,
      netMargin,
    }
  })

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
        <div className="text-xs text-gray-600 dark:text-gray-400">Doanh thu</div>
        <div className="text-sm font-bold text-gray-900 dark:text-white">
          {formatCurrency(revenue)}
        </div>
      </div>
      <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
        <div className="text-xs text-gray-600 dark:text-gray-400">Giá vốn</div>
        <div className="text-sm font-bold text-red-600 dark:text-red-400">
          {formatCurrency(cogs)}
        </div>
      </div>
      <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
        <div className="text-xs text-gray-600 dark:text-gray-400">Lợi nhuận gộp</div>
        <div className="text-sm font-bold text-green-600 dark:text-green-400">
          {formatCurrency(grossProfit)}
        </div>
        <div className="text-xs text-green-700 dark:text-green-300">
          {grossMargin.toFixed(1)}%
        </div>
      </div>
      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
        <div className="text-xs text-gray-600 dark:text-gray-400">Lợi nhuận ròng</div>
        <div className={`text-sm font-bold ${netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
          {formatCurrency(netProfit)}
        </div>
        <div className="text-xs text-blue-700 dark:text-blue-300">
          {netMargin.toFixed(1)}%
        </div>
      </div>
    </div>
  )
}
