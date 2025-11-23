"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@shared/ui/card"
import { TrendingUp, Package } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface TopProductsProps {
  products: Array<{
    productId: string
    productName: string
    quantity: number
    revenue: number
  }>
}

export function TopProducts({ products }: TopProductsProps) {
  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            Sản phẩm bán chạy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            Chưa có dữ liệu bán hàng
          </p>
        </CardContent>
      </Card>
    )
  }

  const maxQuantity = Math.max(...products.map(p => p.quantity))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Sản phẩm bán chạy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.map((product, index) => {
            const percentage = (product.quantity / maxQuantity) * 100
            return (
              <div key={product.productId} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-semibold text-gray-400 dark:text-gray-600 w-5">
                      #{index + 1}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {product.productName}
                    </span>
                  </div>
                  <div className="text-right ml-2">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {product.quantity} đã bán
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatCurrency(product.revenue)}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-linear-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
