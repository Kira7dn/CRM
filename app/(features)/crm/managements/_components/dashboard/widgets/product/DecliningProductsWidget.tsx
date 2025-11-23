"use client"

interface DecliningProduct {
  productId: string
  productName: string
  recentQuantity: number
  previousQuantity: number
  declinePercent: number
}

interface DecliningProductsWidgetProps {
  decliningProducts: DecliningProduct[]
}

export function DecliningProductsWidget({ decliningProducts }: DecliningProductsWidgetProps) {
  if (decliningProducts.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        Không có SP sụt giảm
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {decliningProducts.slice(0, 3).map((product) => (
        <div
          key={product.productId}
          className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-xs text-gray-900 dark:text-white truncate">
                {product.productName}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {product.recentQuantity} sp (trước: {product.previousQuantity})
              </div>
            </div>
            <div className="text-right ml-2">
              <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                {product.declinePercent.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">giảm</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
