"use client"

import { useEffect, useState } from "react"
import { generateRiskAssessment } from "@/app/(features)/crm/_actions/ai-actions"
import type { RiskAssessment } from "@/infrastructure/adapters/ai/risk-assessment-service"
import { Card, CardHeader, CardTitle, CardContent } from "@shared/ui/card"
import { Skeleton } from "@shared/ui/skeleton"
import { TrendingUp, CheckCircle } from "lucide-react"

export function AIRiskOpportunitiesWidget() {
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
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <Skeleton className="h-5 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((idx) => (
            <div key={idx} className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!assessment || assessment.opportunities.length === 0) {
    return (
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            Business Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No opportunities identified
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          Business Opportunities ({assessment.opportunities.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {assessment.opportunities.map((opp, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
          >
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-green-900 dark:text-green-300 mb-1">
                  {opp.title}
                </h4>
                <p className="text-xs text-green-800 dark:text-green-300 mb-1">
                  {opp.description}
                </p>
                <div className="text-xs text-green-700 dark:text-green-400">
                  <strong>Potential:</strong> {opp.potentialImpact}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
