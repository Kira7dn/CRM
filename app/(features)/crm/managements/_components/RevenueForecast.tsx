"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@shared/ui/card"
import { TrendingUp, Brain, Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { RevenueForecast as RevenueForecastType } from "@/infrastructure/ai/revenue-forecast-service"

interface RevenueForecastProps {
  forecast: RevenueForecastType | null
}

export function RevenueForecast({ forecast }: RevenueForecastProps) {
  if (!forecast) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Dự báo doanh thu AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            Dự báo AI không khả dụng. Bật OPENAI_API_KEY để sử dụng tính năng này.
          </p>
        </CardContent>
      </Card>
    )
  }

  const getConfidenceBadge = (confidence: string) => {
    const colors = {
      low: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      high: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    }
    const labels = {
      low: "Thấp",
      medium: "Trung bình",
      high: "Cao",
    }
    return {
      className: colors[confidence as keyof typeof colors] || colors.medium,
      label: labels[confidence as keyof typeof labels] || confidence
    }
  }

  const predictions = [
    {
      period: "Ngày mai",
      icon: Calendar,
      data: forecast.nextDay,
      days: 1,
    },
    {
      period: "7 ngày tới",
      icon: TrendingUp,
      data: forecast.next7Days,
      days: 7,
    },
    {
      period: "30 ngày tới",
      icon: TrendingUp,
      data: forecast.next30Days,
      days: 30,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Dự báo doanh thu AI
        </CardTitle>
      </CardHeader>
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
                className="p-3 rounded-lg border dark:border-gray-700 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-900"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Icon className="w-4 h-4" />
                    <span>{pred.period}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(pred.data.prediction)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ~{formatCurrency(dailyAvg)}/ngày
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {pred.data.reasoning}
                </p>
              </div>
            )
          })}
        </div>

        {/* Trends */}
        {forecast.trends.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Xu hướng nhận diện:
            </h4>
            <div className="flex flex-wrap gap-2">
              {forecast.trends.map((trend, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                >
                  {trend}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {forecast.recommendations.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Khuyến nghị AI:
            </h4>
            <ul className="space-y-1">
              {forecast.recommendations.map((rec, idx) => (
                <li key={idx} className="text-xs text-blue-800 dark:text-blue-300 flex items-start gap-1">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
