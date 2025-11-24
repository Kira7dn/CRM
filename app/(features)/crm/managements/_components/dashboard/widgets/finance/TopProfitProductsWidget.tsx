"use client"

import { formatCurrency } from "@/lib/utils"

interface ProfitProduct {
  productId: number
  name: string
  revenue: number
  cost: number
  profit: number
  margin: number
}

export function TopProfitProductsWidget({
  products
}: { products: ProfitProduct[] }) {

  if (products.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        Chưa có dữ liệu
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {products.slice(0, 5).map((product, idx) => (
        <div
          key={product.productId}
          className="p-2 rounded-lg bg-linear-to-r from-green-50 to-white dark:from-green-950/20 dark:to-gray-900 border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs font-bold text-green-600 dark:text-green-400">
                #{idx + 1}
              </span>
              <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                {product.name}
              </span>
            </div>
            <span className="text-xs font-bold text-green-600 dark:text-green-400 ml-2">
              {formatCurrency(product.profit)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Doanh thu: {formatCurrency(product.revenue)}</span>
            <div className="flex items-center gap-2">
              <span>
                Biên lợi nhuận:
              </span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {`${product.margin.toFixed(1)}%`}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
