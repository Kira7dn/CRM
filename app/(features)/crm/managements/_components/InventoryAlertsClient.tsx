"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@shared/ui/card"
import { PackageX, PackageOpen, Loader2, AlertTriangle } from "lucide-react"
import { getInventoryAlerts } from "../inventory-actions"

interface InventoryAlert {
  lowStock: Array<{
    inventoryId: number
    productId: number
    productName: string
    currentStock: number
    availableStock: number
    reorderPoint: number
    daysRemaining: number | null
  }>
  outOfStock: Array<{
    inventoryId: number
    productId: number
    productName: string
    currentStock: number
    reservedStock: number
  }>
}

export function InventoryAlertsClient() {
  const [alerts, setAlerts] = useState<InventoryAlert | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadAlerts() {
      try {
        const data = await getInventoryAlerts()
        if (mounted) {
          setAlerts(data)
        }
      } catch (error) {
        console.error("Failed to load inventory alerts:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadAlerts()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PackageOpen className="w-5 h-5" />
            Cảnh báo tồn kho
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

  if (!alerts || (alerts.lowStock.length === 0 && alerts.outOfStock.length === 0)) {
    return (
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
            <PackageOpen className="w-5 h-5" />
            Tình trạng kho hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Tất cả sản phẩm đều còn hàng
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalAlerts = alerts.outOfStock.length + alerts.lowStock.length

  return (
    <Card className="border-orange-200 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-orange-700 dark:text-orange-400">
          <AlertTriangle className="w-5 h-5" />
          Cảnh báo tồn kho ({totalAlerts})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Out of Stock */}
        {alerts.outOfStock.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
              <PackageX className="w-4 h-4" />
              Hết hàng ({alerts.outOfStock.length})
            </h4>
            {alerts.outOfStock.map((item) => (
              <div
                key={item.inventoryId}
                className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.productName}
                  </span>
                  <span className="text-xs text-red-600 dark:text-red-400 font-semibold">
                    HẾT HÀNG
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Đã đặt trước: {item.reservedStock} sản phẩm
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Low Stock */}
        {alerts.lowStock.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-2">
              <PackageOpen className="w-4 h-4" />
              Sắp hết hàng ({alerts.lowStock.length})
            </h4>
            {alerts.lowStock.map((item) => (
              <div
                key={item.inventoryId}
                className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.productName}
                  </span>
                  <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                    Còn {item.availableStock}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Mức đặt lại: {item.reorderPoint}</span>
                  {item.daysRemaining && (
                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                      ~{item.daysRemaining} ngày
                    </span>
                  )}
                </div>
                <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${item.availableStock <= item.reorderPoint / 2
                        ? "bg-red-500"
                        : "bg-orange-500"
                      }`}
                    style={{
                      width: `${Math.min(100, (item.availableStock / item.reorderPoint) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
