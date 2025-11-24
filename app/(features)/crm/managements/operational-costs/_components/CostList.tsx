"use client"

import { useState } from "react"
import type { OperationalCost, CostCategory } from "@/core/domain/managements/operational-cost"
import { calculatePeriodCosts } from "@/core/domain/managements/operational-cost"
import { deleteCostAction } from "../actions"
import { CostForm } from "./CostForm"
import { CategoryStats } from "./CategoryStats"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@shared/ui/card"
import { Button } from "@shared/ui/button"

interface CostListProps {
  initialCosts: OperationalCost[]
}

export function CostList({ initialCosts }: CostListProps) {
  const [costs, setCosts] = useState(initialCosts)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<CostCategory | "all">("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCost, setEditingCost] = useState<OperationalCost | null>(null)

  // Filter costs
  const filteredCosts = costs.filter((cost) => {
    const matchesSearch = !searchQuery ||
      cost.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || cost.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Calculate stats for current period (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const periodStats = calculatePeriodCosts(costs, thirtyDaysAgo, new Date())

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this cost?")) {
      return
    }

    try {
      await deleteCostAction(id)
      setCosts(costs.filter((c) => c.id !== id))
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete cost")
    }
  }

  const handleEdit = (cost: OperationalCost) => {
    setEditingCost(cost)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingCost(null)
  }

  return (
    <div>
      <Tabs defaultValue="summary" className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="list">All Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Costs (30 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {periodStats.total.toLocaleString()} VND
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Fixed Costs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {periodStats.fixed.toLocaleString()} VND
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Variable Costs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {periodStats.variable.toLocaleString()} VND
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="category">
          <CategoryStats costs={costs} />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {/* Filters & Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search costs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 flex-1"
            />

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as CostCategory | "all")}
              className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">All Categories</option>
              <option value="order_processing">Order Processing</option>
              <option value="shipping">Shipping</option>
              <option value="packaging">Packaging</option>
              <option value="marketing">Marketing</option>
              <option value="staff_salary">Staff Salary</option>
              <option value="utilities">Utilities</option>
              <option value="rent">Rent</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </select>

            <Button onClick={() => setIsFormOpen(true)}>
              Add Cost
            </Button>
          </div>

          {/* Cost Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCosts.map((cost) => (
                      <tr key={cost.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 text-sm">
                          {new Date(cost.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="capitalize">{cost.category.replace(/_/g, ' ')}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="capitalize">{cost.type}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">{cost.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          {cost.amount.toLocaleString()} VND
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleEdit(cost)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(cost.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredCosts.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No costs found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cost Form Modal */}
      {isFormOpen && (
        <CostForm
          cost={editingCost}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}
