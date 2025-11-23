"use client"

import { TrendingDown, XCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface RiskAlertsProps {
  stats: {
    todayRevenue: number
    errorRate: number
    riskAlerts: {
      revenueDropAlert: boolean
      cancelRateAlert: boolean
      avg7DaysRevenue: number
    }
  }
}

export function RiskAlerts({ stats }: RiskAlertsProps) {
  const alerts = []

  if (stats.riskAlerts.revenueDropAlert) {
    alerts.push({
      type: "revenue",
      icon: TrendingDown,
      title: "Phát hiện sụt giảm doanh thu",
      message: `Doanh thu hôm nay (${formatCurrency(stats.todayRevenue)}) thấp hơn 30% so với trung bình 7 ngày (${formatCurrency(stats.riskAlerts.avg7DaysRevenue)})`,
      severity: "high" as const,
    })
  }

  if (stats.riskAlerts.cancelRateAlert) {
    alerts.push({
      type: "cancel",
      icon: XCircle,
      title: "Tỷ lệ hủy đơn cao",
      message: `Tỷ lệ lỗi đang ở mức ${stats.errorRate.toFixed(1)}% (vượt ngưỡng 10%)`,
      severity: "high" as const,
    })
  }

  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium">Hệ thống hoạt động bình thường - Không có cảnh báo</span>
      </div>
    )
  }

  return (
    <>

      {alerts.map((alert, index) => {
        const Icon = alert.icon
        return (
          <div
            key={index}
            className={`p-3 rounded-lg border-l-4 ${alert.severity === "high"
              ? "bg-red-50 dark:bg-red-950/20 border-red-500"
              : "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500"
              }`}
          >
            <div className="flex items-start gap-3">
              <Icon
                className={`w-5 h-5 mt-0.5 ${alert.severity === "high"
                  ? "text-red-600 dark:text-red-400"
                  : "text-yellow-600 dark:text-yellow-400"
                  }`}
              />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                  {alert.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {alert.message}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
