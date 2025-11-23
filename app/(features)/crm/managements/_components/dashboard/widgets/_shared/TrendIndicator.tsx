import { TrendingUp, TrendingDown } from "lucide-react"

interface TrendIndicatorProps {
  value: number
}

export function TrendIndicator({ value }: TrendIndicatorProps) {
  const isPositive = value >= 0
  const color = isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
  const Icon = isPositive ? TrendingUp : TrendingDown

  return (
    <div className={`flex items-center gap-1 text-xs font-semibold ${color}`}>
      <Icon className="w-3 h-3" />
      <span>{isPositive ? "+" : ""}{Math.abs(value).toFixed(1)}%</span>
    </div>
  )
}
