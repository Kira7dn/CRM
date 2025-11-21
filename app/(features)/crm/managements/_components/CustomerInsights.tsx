"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@shared/ui/card"
import { Users, UserCheck, UserX } from "lucide-react"

interface CustomerInsightsProps {
  stats: {
    totalCustomers: number
    todayNewCustomers: number
    returningCustomers: number
    returningRate: number
    churnRiskCustomers: number
    churnRiskRate: number
  }
}

export function CustomerInsights({ stats }: CustomerInsightsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5" />
          Thông tin khách hàng
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span className="text-sm">KH mới hôm nay</span>
            </div>
            <div className="text-2xl font-bold">{stats.todayNewCustomers}</div>
            <div className="text-xs text-gray-500">
              Tổng: {stats.totalCustomers.toLocaleString()}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <UserCheck className="w-4 h-4" />
              <span className="text-sm">KH quay lại</span>
            </div>
            <div className="text-2xl font-bold">{stats.returningCustomers}</div>
            <div className="text-xs text-gray-500">
              {stats.returningRate.toFixed(1)}% tỷ lệ quay lại
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <UserX className="w-4 h-4" />
              <span className="text-sm">Nguy cơ mất (30+ ngày)</span>
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.churnRiskCustomers}
            </div>
            <div className="text-xs text-gray-500">
              {stats.churnRiskRate.toFixed(1)}% có nguy cơ
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Chỉ số sức khỏe KH</span>
            <span className={`font-semibold ${
              stats.churnRiskRate < 15 ? "text-green-600" :
              stats.churnRiskRate < 30 ? "text-yellow-600" :
              "text-red-600"
            }`}>
              {stats.churnRiskRate < 15 ? "Tốt" :
               stats.churnRiskRate < 30 ? "Nguy cơ vừa" :
               "Nguy cơ cao"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
