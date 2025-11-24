"use client"

import { useState } from "react"
import type { StockMovement, InventorySummary, MovementType } from "@/core/domain/managements/inventory"
import type { Product } from "@/core/domain/managements/product"
import { InventoryForm } from "./InventoryForm"
import { StockMovementForm } from "./StockMovementForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@shared/ui/card"
import { Button } from "@shared/ui/button"

interface InventoryListProps {
  initialInventory: InventorySummary[]
  initialMovements: StockMovement[]
  products: Product[]
}

export function InventoryList({ initialInventory, initialMovements, products }: InventoryListProps) {
  const [inventory, setInventory] = useState(initialInventory)
  const [movements, setMovements] = useState(initialMovements)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<MovementType | "all">("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isMovementFormOpen, setIsMovementFormOpen] = useState(false)
  const [editingInventory, setEditingInventory] = useState<InventorySummary | null>(null)
  const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(null)

  // Helper to get product name
  const getProductName = (productId: number): string => {
    const product = products.find(p => p.id === productId)
    return product ? product.name : `Product #${productId}`
  }

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    const productName = getProductName(item.productId)
    const matchesSearch = !searchQuery ||
      item.productId.toString().includes(searchQuery) ||
      productName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Calculate stats
  const totalItems = inventory.length
  const lowStockItems = inventory.filter(item => item.currentStock <= item.reorderPoint && item.currentStock > 0).length
  const outOfStockItems = inventory.filter(item => item.currentStock <= 0).length
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * (item.averageCost || 0)), 0)

  const handleEdit = (item: InventorySummary) => {
    setEditingInventory(item)
    setIsFormOpen(true)
  }

  const handleAddMovement = (inventoryId: number) => {
    setSelectedInventoryId(inventoryId)
    setIsMovementFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingInventory(null)
  }

  const handleCloseMovementForm = () => {
    setIsMovementFormOpen(false)
    setSelectedInventoryId(null)
  }

  const getStatusColor = (currentStock: number, reorderPoint: number) => {
    if (currentStock <= 0) {
      return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400"
    } else if (currentStock <= reorderPoint) {
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400"
    } else {
      return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400"
    }
  }

  return (
    <div>
      <Tabs defaultValue="summary" className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="list">All Items</TabsTrigger>
          <TabsTrigger value="movements">Recent Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalItems}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Low Stock Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Out of Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Value (Est.)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalValue.toLocaleString()} VND
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alert */}
          {lowStockItems > 0 && (
            <Card className="border-yellow-200 dark:border-yellow-900">
              <CardHeader>
                <CardTitle className="text-yellow-600 dark:text-yellow-400">
                  Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {inventory
                    .filter(item => item.currentStock <= item.reorderPoint && item.currentStock > 0)
                    .map(item => (
                      <div key={item.productId} className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                        <span className="font-medium">{getProductName(item.productId)}</span>
                        <span className="text-sm">{item.currentStock} units remaining (Reorder at {item.reorderPoint})</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {/* Filters & Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by product name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 flex-1"
            />
          </div>

          {/* Inventory Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Current Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reorder Point</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Average Cost</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Value</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredInventory.map((item) => {
                      const statusText = item.currentStock <= 0
                        ? 'OUT OF STOCK'
                        : item.currentStock <= item.reorderPoint
                          ? 'LOW STOCK'
                          : 'IN STOCK'


                      return (
                        <tr key={item.productId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium">{getProductName(item.productId)}</div>
                            <div className="text-xs text-gray-500">ID: {item.productId}</div>
                          </td>
                          <td className="px-4 py-3 text-sm">{item.currentStock}</td>
                          <td className="px-4 py-3 text-sm">{item.reorderPoint}</td>
                          <td className="px-4 py-3 text-sm">{item.averageCost?.toLocaleString('vi-VN')} VND</td>
                          <td className="px-4 py-3 text-sm">{(item.currentStock * (item.averageCost || 0)).toLocaleString('vi-VN')} VND</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.currentStock, item.reorderPoint)}`}>
                              {statusText}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleAddMovement(item.productId)}
                                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                              >
                                Add Movement
                              </button>
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {filteredInventory.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No inventory items found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by product name, ID, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 flex-1"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as MovementType | "all")}
              className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">All Types</option>
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
              <option value="adjustment">Adjustment</option>
              <option value="return">Return</option>
            </select>

            <Button onClick={() => setIsMovementFormOpen(true)}>
              Add Stock Movement
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stock Movement History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unit Cost</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reason</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Performed By</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Order ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {movements
                      .filter((movement) => {
                        const productName = getProductName(movement.productId)
                        const matchesSearch = !searchQuery ||
                          movement.productId.toString().includes(searchQuery) ||
                          productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          movement.reason?.toLowerCase().includes(searchQuery.toLowerCase())
                        const matchesType = statusFilter === "all" || movement.type === statusFilter
                        return matchesSearch && matchesType
                      })
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((movement) => {
                        const typeColors: Record<MovementType, string> = {
                          in: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
                          out: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
                          adjustment: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
                          return: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400"
                        }

                        return (
                          <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-4 py-3 text-sm">
                              {new Date(movement.createdAt).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="font-medium">{getProductName(movement.productId)}</div>
                              <div className="text-xs text-gray-500">ID: {movement.productId}</div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[movement.type]}`}>
                                {movement.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">{movement.quantity}</td>
                            <td className="px-4 py-3 text-sm">{movement.unitCost.toLocaleString('vi-VN')} VND</td>
                            <td className="px-4 py-3 text-sm">{movement.reason || '-'}</td>
                            <td className="px-4 py-3 text-sm">{movement.performedBy || '-'}</td>
                            <td className="px-4 py-3 text-sm">{movement.referenceOrderId || '-'}</td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>

              {movements.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No stock movements found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Inventory Form Modal */}
      {isFormOpen && (
        <InventoryForm
          productId={editingInventory?.productId || 0}
          initialQuantity={editingInventory?.currentStock || 0}
          initialUnitCost={editingInventory?.averageCost || 0}
          reorderPoint={editingInventory?.reorderPoint || 10}
          reorderQuantity={editingInventory?.reorderQuantity || 50}
          onClose={handleCloseForm}
        />
      )}

      {/* Stock Movement Form Modal */}
      {isMovementFormOpen && (
        <StockMovementForm
          inventoryId={selectedInventoryId}
          products={products}
          onClose={handleCloseMovementForm}
        />
      )}
    </div>
  )
}
