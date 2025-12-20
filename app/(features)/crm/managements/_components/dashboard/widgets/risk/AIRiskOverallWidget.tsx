"use client"

import { useEffect, useState } from "react"
import type { RiskAssessment } from "@/infrastructure/adapters/ai/risk-assessment-service"
import { Card, CardHeader, CardTitle, CardContent } from "@shared/ui/card"
import { Skeleton } from "@shared/ui/skeleton"
import { Shield } from "lucide-react"

const getRiskLevelColor = (level: string) => {
  const colors = {
    low: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    medium: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
    high: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
    critical: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
  }
  return colors[level as keyof typeof colors] || colors.medium
}

export function AIRiskOverallWidget() {
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // async function loadAssessment() {
    //   try {
    //     const result = await generateRiskAssessment()
    //     if (mounted) {
    //       if (result.success && result.assessment) {
    //         setAssessment(result.assessment)
    //       }
    //     }
    //   } catch (error) {
    //     console.error("Failed to load risk assessment:", error)
    //   } finally {
    //     if (mounted) {
    //       setLoading(false)
    //     }
    //   }
    // }

    // loadAssessment()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              AI Risk Assessment
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    )
  }

  if (!assessment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            AI Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            AI risk assessment is not available. Enable OPENAI_API_KEY to use this feature.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-2 ${assessment.overallRiskLevel === "critical" ? "border-red-300 dark:border-red-700" :
      assessment.overallRiskLevel === "high" ? "border-orange-300 dark:border-orange-700" :
        assessment.overallRiskLevel === "medium" ? "border-yellow-300 dark:border-yellow-700" :
          "border-green-300 dark:border-green-700"
      }`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            AI Risk Assessment
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm px-3 py-1 rounded-full font-semibold ${getRiskLevelColor(assessment.overallRiskLevel)}`}>
              {assessment.overallRiskLevel.toUpperCase()}
            </span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {assessment.riskScore}/100
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {assessment.summary}
        </p>
      </CardContent>
    </Card>
  )
}
