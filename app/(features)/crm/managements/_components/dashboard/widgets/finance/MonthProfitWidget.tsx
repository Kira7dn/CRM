"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { getProfitAnalysis } from "../../../../_actions/inventory-actions"
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

export function MonthProfitWidget() {
  const [data, setData] = useState<ProfitMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  // Make data available to CopilotKit (must be before early returns)
  useCopilotReadable({
    description: "30-day trailing profit metrics including revenue, COGS, gross profit, gross margin, operational costs, net profit, and net margin",
    value: data || {
      revenue: 0,
      cogs: 0,
      grossProfit: 0,
      grossMargin: 0,
      operationalCosts: 0,
      netProfit: 0,
      netMargin: 0,
    }
  })

  useEffect(() => {
    let mounted = true

    async function loadData() {
      try {
        const result = await getProfitAnalysis()
        if (mounted && result) {
          setData((result as { last30Days?: ProfitMetrics }).last30Days || null)
        }
      } catch (error) {
        console.error("Failed to load profit analysis:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4 min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!data) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        Thêm giá vốn sản phẩm để kích hoạt
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
        <div className="text-xs text-gray-600 dark:text-gray-400">Doanh thu</div>
        <div className="text-sm font-bold text-gray-900 dark:text-white">
          {formatCurrency(data.revenue)}
        </div>
      </div>
      <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
        <div className="text-xs text-gray-600 dark:text-gray-400">Giá vốn</div>
        <div className="text-sm font-bold text-red-600 dark:text-red-400">
          -{formatCurrency(data.cogs)}
        </div>
      </div>
      <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
        <div className="text-xs text-gray-600 dark:text-gray-400">LN gộp</div>
        <div className="text-sm font-bold text-green-600 dark:text-green-400">
          {formatCurrency(data.grossProfit)}
        </div>
        <div className="text-xs text-green-700 dark:text-green-300">
          {data.grossMargin.toFixed(1)}%
        </div>
      </div>
      <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20">
        <div className="text-xs text-gray-600 dark:text-gray-400">LN ròng</div>
        <div className={`text-sm font-bold ${data.netProfit >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400'}`}>
          {formatCurrency(data.netProfit)}
        </div>
        <div className="text-xs text-purple-700 dark:text-purple-300">
          {data.netMargin.toFixed(1)}%
        </div>
      </div>
    </div>
  )
}
