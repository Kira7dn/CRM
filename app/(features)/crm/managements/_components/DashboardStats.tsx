"use client"

import { formatCurrency } from "@/lib/utils"
import { Card, CardContent } from "@shared/ui/card"
import Link from "next/link"
import { TrendingUp, TrendingDown } from "lucide-react"

interface DashboardStatsProps {
  stats: {
    // Revenue metrics
    todayRevenue: number
    yesterdayRevenue: number
    thisMonthRevenue: number
    lastMonthRevenue: number
    revenueChangeVsYesterday: number
    revenueChangeVsLastMonth: number

    // Order metrics
    totalOrders: number
    todayOrderCount: number
    pendingOrders: number
    completedOrders: number
    cancelledOrders: number
    completionRate: number
    aov: number
    errorRate: number

    // Customer metrics
    totalCustomers: number
    todayNewCustomers: number
    returningCustomers: number
    returningRate: number
    churnRiskCustomers: number
    churnRiskRate: number

    // Product metrics
    totalProducts: number
    topSellingProducts: Array<{
      productId: string
      productName: string
      quantity: number
      revenue: number
    }>

    // Risk alerts
    riskAlerts: {
      revenueDropAlert: boolean
      cancelRateAlert: boolean
      avg7DaysRevenue: number
    }
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const formatChangeValue = (value: number) => {
    const formatted = Math.abs(value).toFixed(1)
    const sign = value >= 0 ? "+" : "-"
    return `${sign}${formatted}%`
  }

  const getChangeColor = (value: number) => {
    if (value >= 0) return "text-green-600 dark:text-green-400"
    return "text-red-600 dark:text-red-400"
  }

  const statCards = [
    {
      title: "Doanh thu hôm nay",
      value: formatCurrency(stats.todayRevenue),
      icon: "💰",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      change: stats.revenueChangeVsYesterday,
      subtext: `so với ${formatCurrency(stats.yesterdayRevenue)} hôm qua`,
      href: "/crm/analytics/revenue",
    },
    {
      title: "Doanh thu tháng",
      value: formatCurrency(stats.thisMonthRevenue),
      icon: "📊",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      change: stats.revenueChangeVsLastMonth,
      subtext: `so với ${formatCurrency(stats.lastMonthRevenue)} tháng trước`,
      href: "/crm/analytics/revenue",
    },
    {
      title: "Đơn hàng hôm nay",
      value: stats.todayOrderCount.toString(),
      icon: "📦",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      subtext: `${stats.pendingOrders} chờ xử lý, ${stats.completionRate.toFixed(1)}% hoàn thành`,
      href: "/crm/managements/orders",
    },
    {
      title: "Giá trị đơn TB",
      value: formatCurrency(stats.aov),
      icon: "💳",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
      subtext: `${stats.totalOrders} tổng đơn`,
      href: "/crm/analytics/revenue",
    },
    {
      title: "Khách hàng mới",
      value: stats.todayNewCustomers.toString(),
      icon: "👥",
      bgColor: "bg-teal-100 dark:bg-teal-900/30",
      subtext: `${stats.totalCustomers} tổng, ${stats.returningRate.toFixed(1)}% quay lại`,
      href: "/crm/analytics/customer",
    },
    {
      title: "Nguy cơ rời bỏ",
      value: stats.churnRiskCustomers.toString(),
      icon: "⚠️",
      bgColor: stats.churnRiskRate > 20 ? "bg-red-100 dark:bg-red-900/30" : "bg-yellow-100 dark:bg-yellow-900/30",
      subtext: `${stats.churnRiskRate.toFixed(1)}% khách hàng`,
      href: "/crm/analytics/customer",
      alert: stats.churnRiskRate > 20,
    },
    {
      title: "Tỷ lệ lỗi",
      value: `${stats.errorRate.toFixed(1)}%`,
      icon: "❌",
      bgColor: stats.errorRate > 10 ? "bg-red-100 dark:bg-red-900/30" : "bg-gray-100 dark:bg-gray-900/30",
      subtext: `${stats.cancelledOrders} đơn bị hủy`,
      href: "/crm/managements/orders",
      alert: stats.errorRate > 10,
    },
    {
      title: "Sản phẩm",
      value: stats.totalProducts.toString(),
      icon: "🏷️",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      subtext: `${stats.topSellingProducts.length} bán chạy`,
      href: "/crm/managements/products",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <Link key={index} href={card.href} className="block group">
            <Card className={`hover:shadow-lg transition-all hover:-translate-y-0.5 ${card.alert ? 'border-red-300 dark:border-red-700' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`${card.bgColor} p-2 rounded-lg`}>
                    <span className="text-xl">{card.icon}</span>
                  </div>
                  {card.change !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-semibold ${getChangeColor(card.change)}`}>
                      {card.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{formatChangeValue(card.change)}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </h3>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                  {card.value}
                </p>
                {card.subtext && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {card.subtext}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
