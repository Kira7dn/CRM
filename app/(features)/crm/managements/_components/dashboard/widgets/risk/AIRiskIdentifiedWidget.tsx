"use client"

import { useEffect, useState } from "react"
import { generateRiskAssessment } from "@/app/(features)/crm/_actions/ai-actions"
import type { RiskAssessment } from "@/infrastructure/adapters/ai/risk-assessment-service"
import { Card, CardHeader, CardTitle, CardContent } from "@shared/ui/card"
import { Skeleton } from "@shared/ui/skeleton"
import { AlertTriangle } from "lucide-react"


export function AIRiskIdentifiedWidget() {
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadAssessment() {
      try {
        const result = await generateRiskAssessment()
        if (mounted) {
          if (result.success && result.assessment) {
            setAssessment(result.assessment)
          }
        }
      } catch (error) {
        console.error("Failed to load risk assessment:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadAssessment()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <Skeleton className="h-5 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="p-3 rounded-lg border-l-4 border-gray-300 bg-gray-50 dark:bg-gray-950/20">
              <div className="flex items-start gap-3">
                <Skeleton className="w-8 h-8 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }
  if (!assessment || assessment.risks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            Identified Risks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No risks identified
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          Identified Risks ({assessment.risks.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {assessment.risks.map((risk, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border-l-4 ${risk.severity === "critical" ? "border-red-500 bg-red-50 dark:bg-red-950/20" :
              risk.severity === "high" ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20" :
                risk.severity === "medium" ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20" :
                  "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
              }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getCategoryIcon(risk.category)}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                    {risk.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRiskLevelColor(risk.severity)}`}>
                      {risk.severity}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Likelihood: {risk.likelihood}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                  {risk.description}
                </p>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <strong>Impact:</strong> {risk.impact}
                </div>
                {risk.recommendations.length > 0 && (
                  <div className="mt-2 pl-3 border-l-2 border-gray-300 dark:border-gray-600">
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Recommendations:
                    </div>
                    <ul className="space-y-1">
                      {risk.recommendations.map((rec, recIdx) => (
                        <li key={recIdx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                          <span className="text-green-600 dark:text-green-400">✓</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface AIRiskIdentifiedWidgetProps {
  assessment: RiskAssessment | null
  isLoading?: boolean
}

const getRiskLevelColor = (level: string) => {
  const colors = {
    low: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    medium: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
    high: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
    critical: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
  }
  return colors[level as keyof typeof colors] || colors.medium
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "revenue":
      return "💰"
    case "operations":
      return "⚙️"
    case "customer":
      return "👥"
    case "inventory":
      return "📦"
    case "financial":
      return "💳"
    default:
      return "⚠️"
  }
}