"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@shared/ui/card"
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react"
import type { RiskAssessment } from "@/infrastructure/ai/risk-assessment-service"

interface AIRiskAssessmentProps {
  assessment: RiskAssessment | null
}

export function AIRiskAssessment({ assessment }: AIRiskAssessmentProps) {
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

  return (
    <div className="space-y-4">
      {/* Overall Risk Score */}
      <Card className={`border-2 ${
        assessment.overallRiskLevel === "critical" ? "border-red-300 dark:border-red-700" :
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

      {/* Identified Risks */}
      {assessment.risks.length > 0 && (
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
                className={`p-3 rounded-lg border-l-4 ${
                  risk.severity === "critical" ? "border-red-500 bg-red-50 dark:bg-red-950/20" :
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
      )}

      {/* Business Opportunities */}
      {assessment.opportunities.length > 0 && (
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
      )}
    </div>
  )
}
