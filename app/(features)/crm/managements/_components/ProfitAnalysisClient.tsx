"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@shared/ui/card"
import { TrendingUp, Loader2, DollarSign, PieChart } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { getProfitAnalysis } from "../inventory-actions"

interface ProfitData {
  today: {
    revenue: number
    cogs: number
    grossProfit: number
    grossMargin: number
    operationalCosts: number
    netProfit: number
    netMargin: number
  }
  month: {
    revenue: number
    cogs: number
    grossProfit: number
    grossMargin: number
    operationalCosts: number
    netProfit: number
    netMargin: number
  }
  topProfitProducts: Array<{
    productId: number
    name: string
    revenue: number
    cost: number
    profit: number
    margin: number
  }>
}

export function ProfitAnalysisClient() {
  const [data, setData] = useState<ProfitData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadData() {
      try {
        const result = await getProfitAnalysis()
        if (mounted && result) {
          setData(result as ProfitData)
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Phân tích lợi nhuận
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Phân tích lợi nhuận
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            Thêm giá vốn sản phẩm để kích hoạt phân tích lợi nhuận
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Today's Profit */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            Lợi nhuận hôm nay
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="text-xs text-gray-600 dark:text-gray-400">Doanh thu</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.today.revenue)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
              <div className="text-xs text-gray-600 dark:text-gray-400">Giá vốn</div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                -{formatCurrency(data.today.cogs)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="text-xs text-gray-600 dark:text-gray-400">Lợi nhuận gộp</div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(data.today.grossProfit)}
              </div>
              <div className="text-xs text-green-700 dark:text-green-300">
                {data.today.grossMargin.toFixed(1)}% biên
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="text-xs text-gray-600 dark:text-gray-400">Lợi nhuận ròng</div>
              <div className={`text-lg font-bold ${data.today.netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(data.today.netProfit)}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300">
                {data.today.netMargin.toFixed(1)}% biên
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Month's Profit */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Lợi nhuận tháng này
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="text-xs text-gray-600 dark:text-gray-400">Doanh thu</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.month.revenue)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
              <div className="text-xs text-gray-600 dark:text-gray-400">Giá vốn</div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                -{formatCurrency(data.month.cogs)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="text-xs text-gray-600 dark:text-gray-400">Lợi nhuận gộp</div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(data.month.grossProfit)}
              </div>
              <div className="text-xs text-green-700 dark:text-green-300">
                {data.month.grossMargin.toFixed(1)}% biên
              </div>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <div className="text-xs text-gray-600 dark:text-gray-400">Lợi nhuận ròng</div>
              <div className={`text-lg font-bold ${data.month.netProfit >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(data.month.netProfit)}
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-300">
                {data.month.netMargin.toFixed(1)}% biên
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Profit Products */}
      {data.topProfitProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top sản phẩm đóng góp lợi nhuận (Tháng này)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.topProfitProducts.map((product, idx) => (
                <div
                  key={product.productId}
                  className="p-2 rounded-lg bg-gradient-to-r from-green-50 to-white dark:from-green-950/20 dark:to-gray-900 border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        #{idx + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(product.profit)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Doanh thu: {formatCurrency(product.revenue)}</span>
                    <span>Chi phí: {formatCurrency(product.cost)}</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {product.margin.toFixed(1)}% biên
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
