import { ReactNode } from "react"
import Link from "next/link"
import { TrendIndicator } from "./TrendIndicator"

interface MetricCardProps {
  value: string | number
  label?: string
  href?: string
  trend?: {
    value: number
    label: string
  }
  children?: ReactNode
}

export function MetricCard({ value, label, href, trend, children }: MetricCardProps) {
  const content = (
    <>
      {children}
      {trend && (
        <div className="flex items-center justify-between mb-2">
          <TrendIndicator value={trend.value} />
        </div>
      )}
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
        {value}
      </p>
      {label && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {label}
        </p>
      )}
    </>
  )

  if (href) {
    return (
      <Link href={href} className="block group">
        {content}
      </Link>
    )
  }

  return <div>{content}</div>
}
