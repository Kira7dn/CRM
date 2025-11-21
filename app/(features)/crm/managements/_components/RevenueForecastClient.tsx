"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@shared/ui/card"
import { Brain, Loader2 } from "lucide-react"
import { RevenueForecast } from "./RevenueForecast"
import { generateRevenueForecast } from "../ai-actions"
import type { RevenueForecast as RevenueForecastType } from "@/infrastructure/ai/revenue-forecast-service"

export function RevenueForecastClient() {
  const [forecast, setForecast] = useState<RevenueForecastType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadForecast() {
      try {
        const result = await generateRevenueForecast()
        if (mounted) {
          if (result.success && result.forecast) {
            setForecast(result.forecast)
          } else {
            setError(result.error || "Failed to load forecast")
          }
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to load forecast")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadForecast()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            AI Revenue Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Generating AI predictions...
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            AI Revenue Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 dark:text-red-400 text-center py-4">
            {error}
          </p>
        </CardContent>
      </Card>
    )
  }

  return <RevenueForecast forecast={forecast} />
}
