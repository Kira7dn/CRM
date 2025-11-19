"use client";

/**
 * Top Products Table Component
 *
 * Displays top-performing products by revenue in a table format.
 */

import { TopProduct } from "@/core/domain/analytics/revenue-metrics";
import { Card } from "@/@shared/ui/card";

interface TopProductsTableProps {
  products: TopProduct[];
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Top Products by Revenue</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Rank</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Product</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Revenue</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Orders</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No data available for this period
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr key={product.productId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.productName}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{product.productName}</p>
                        <p className="text-xs text-gray-500">ID: {product.productId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right font-semibold text-gray-900">
                    {formatCurrency(product.revenue)}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-700">
                    {product.orderCount}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-700">
                    {product.quantity}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
