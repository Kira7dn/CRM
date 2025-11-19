"use client"

import { formatCurrency } from "@/lib/utils"

interface DashboardStatsProps {
  stats: {
    totalOrders: number
    pendingOrders: number
    completedOrders: number
    totalRevenue: number
    totalProducts: number
    totalCustomers: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: "💰",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      change: "+12.5%",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: "📦",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      subtext: `${stats.pendingOrders} pending`,
    },
    {
      title: "Customers",
      value: stats.totalCustomers.toString(),
      icon: "👥",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      change: "+5.2%",
    },
    {
      title: "Products",
      value: stats.totalProducts.toString(),
      icon: "🏷️",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`${card.bgColor} p-3 rounded-lg`}>
              <span className="text-2xl">{card.icon}</span>
            </div>
            {card.change && (
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                {card.change}
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {card.title}
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {card.value}
          </p>
          {card.subtext && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {card.subtext}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
