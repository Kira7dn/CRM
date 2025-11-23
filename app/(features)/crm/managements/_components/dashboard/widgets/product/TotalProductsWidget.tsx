"use client"

import Link from "next/link"

interface TotalProductsWidgetProps {
  totalProducts: number
  topSellingCount: number
}

export function TotalProductsWidget({
  totalProducts,
  topSellingCount,
}: TotalProductsWidgetProps) {
  return (
    <Link href="/crm/managements/products" className="block group">
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
        {totalProducts}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        {topSellingCount} bán chạy
      </p>
    </Link>
  )
}
