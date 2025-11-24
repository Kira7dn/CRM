"use client"

import type { OperationalCost } from "@/core/domain/managements/operational-cost"
import { calculatePeriodCosts } from "@/core/domain/managements/operational-cost"
import { Card, CardContent, CardHeader, CardTitle } from "@shared/ui/card"

interface CategoryStatsProps {
  costs: OperationalCost[]
}

export function CategoryStats({ costs }: CategoryStatsProps) {
  // Calculate stats for last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const stats = calculatePeriodCosts(costs, thirtyDaysAgo, new Date())

  const categoryLabels: Record<string, string> = {
    order_processing: "Order Processing",
    shipping: "Shipping",
    packaging: "Packaging",
    marketing: "Marketing",
    staff_salary: "Staff Salary",
    utilities: "Utilities",
    rent: "Rent",
    maintenance: "Maintenance",
    other: "Other"
  }

  const categoryData = Object.entries(stats.byCategory)
    .map(([category, amount]) => ({
      category,
      label: categoryLabels[category] || category,
      amount,
      percentage: stats.total > 0 ? (amount / stats.total) * 100 : 0
    }))
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown by Category (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData.map((item) => (
              <div key={item.category}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{item.label}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold">{item.amount.toLocaleString()} VND</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}

            {categoryData.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No costs recorded in the last 30 days
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total.toLocaleString()} VND
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Average Daily Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.total / 30).toLocaleString()} VND
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
