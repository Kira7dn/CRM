"use client"

import { useEffect, useState } from "react"
import { AIRiskOpportunitiesWidget } from "./AIRiskOpportunitiesWidget"
import { generateRiskAssessment } from "../../../../_actions/ai-actions"
import type { RiskAssessment } from "@/infrastructure/ai/risk-assessment-service"

export function AIRiskOpportunitiesWidgetClient() {
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

  return <AIRiskOpportunitiesWidget assessment={assessment} isLoading={loading} />
}
