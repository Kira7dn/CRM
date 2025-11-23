"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@shared/ui/card"
import { TrendingUp, Brain, Calendar, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { RevenueForecast as ForecastType } from "@/infrastructure/ai/revenue-forecast-service"
import { useEffect, useState, useMemo, useCallback } from "react"
import { Badge } from "@/@shared/ui/badge"
import { generateRevenueForecast } from "../../../../_actions/ai-actions"

const CONFIDENCE_STYLES = {
  low: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  high: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
} as const

const CONFIDENCE_LABELS = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
} as const

function getConfidenceBadge(confidence: string) {
  return {
    className: CONFIDENCE_STYLES[confidence as keyof typeof CONFIDENCE_STYLES] || CONFIDENCE_STYLES.medium,
    label: CONFIDENCE_LABELS[confidence as keyof typeof CONFIDENCE_LABELS] || confidence,
  }
}

export function RevenueForecast() {
  const [forecast, setForecast] = useState<ForecastType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadForecast = useCallback(async () => {
    try {
      const result = await generateRevenueForecast()
      if (result.success && result.forecast) {
        setForecast(result.forecast)
      } else {
        setError(result.error || "Không thể tải dự báo doanh thu")
      }
    } catch {
      setError("Không thể tải dự báo doanh thu")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadForecast()
  }, [loadForecast])

  const predictions = useMemo(() => {
    if (!forecast) return []
    return [
      { period: "Ngày mai", icon: Calendar, data: forecast.nextDay, days: 1 },
      { period: "7 ngày tới", icon: TrendingUp, data: forecast.next7Days, days: 7 },
      { period: "30 ngày tới", icon: TrendingUp, data: forecast.next30Days, days: 30 },
    ]
  }, [forecast])

  const renderHeader = (
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        Dự báo doanh thu AI
      </CardTitle>
    </CardHeader>
  )

  if (loading) {
    return (
      <Card>
        {renderHeader}
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Đang phân tích dữ liệu AI...
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !forecast) {
    return (
      <Card>
        {renderHeader}
        <CardContent>
          <p className="text-sm text-red-600 dark:text-red-400 text-center py-4">
            {error || "Không có dữ liệu dự báo"}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {renderHeader}
      <CardContent className="space-y-4">

        {/* Predictions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {predictions.map((pred) => {
            const Icon = pred.icon
            const dailyAvg = pred.data.prediction / pred.days
            const badge = getConfidenceBadge(pred.data.confidence)

            return (
              <div
                key={pred.period}
                className="p-3 rounded-lg border dark:border-gray-700 bg-linear-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-900"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 text-sm">
                    <Icon className="w-4 h-4" />
                    {pred.period}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="text-2xl font-bold">{formatCurrency(pred.data.prediction)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ~{formatCurrency(dailyAvg)}/ngày
                </div>
                <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">{pred.data.reasoning}</p>
              </div>
            )
          })}
        </div>

        {/* Trends */}
        {forecast.trends?.length > 0 && (
          <Section title="Xu hướng nhận diện:">
            <div className="flex flex-wrap gap-2">
              {forecast.trends.map((trend, idx) => (
                <Badge key={idx}>
                  {trend}
                </Badge>
              ))}
            </div>
          </Section>
        )}

        {/* Recommendations */}
        {forecast.recommendations?.length > 0 && (
          <Section title="Khuyến nghị AI:" variant="info">
            <ul className="space-y-1">
              {forecast.recommendations.map((rec, idx) => (
                <li key={idx} className="text-xs flex gap-1">
                  <span>•</span> {rec}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </CardContent>
    </Card>
  )
}

// Small reusable UI helpers
const Section = ({
  children,
  title,
  variant = "default",
}: {
  children: React.ReactNode
  title: string
  variant?: "default" | "info"
}) => (
  <div
    className={
      variant === "info"
        ? "mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
        : "mt-4"
    }
  >
    <h4 className="text-sm font-semibold mb-2">{title}</h4>
    {children}
  </div>
)