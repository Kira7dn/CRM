"use client"

import Link from "next/link"

interface ProcessingTimeWidgetProps {
  avgProcessingTime: number
}

export function ProcessingTimeWidget({ avgProcessingTime }: ProcessingTimeWidgetProps) {
  return (
    <Link href="/crm/managements/orders" className="block group">
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
        {avgProcessingTime.toFixed(1)}h
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        Từ đặt hàng đến xác nhận
      </p>
    </Link>
  )
}
