'use client'

interface ScoringData {
  score?: number
  scoreBreakdown?: Record<string, number>
  weaknesses?: string[]
  suggestedFixes?: string[]
}

interface QualityScoreDisplayProps {
  scoringData: ScoringData | null
}

export default function QualityScoreDisplay({ scoringData }: QualityScoreDisplayProps) {
  if (!scoringData || scoringData.score === undefined) {
    return null
  }

  return (
    <div className="border rounded-lg p-4 bg-linear-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">AI Quality Score: {scoringData.score}/100</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          scoringData.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
          scoringData.score >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
        }`}>
          {scoringData.score >= 80 ? 'Excellent' : scoringData.score >= 60 ? 'Good' : 'Needs Improvement'}
        </div>
      </div>

      {/* Score Breakdown */}
      {scoringData.scoreBreakdown && (
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(scoringData.scoreBreakdown).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">{value}/20</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 capitalize mt-1">
                {key === 'brandVoice' ? 'Brand Voice' : key === 'platformFit' ? 'Platform Fit' : key}
              </div>
              <div className="mt-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${value >= 16 ? 'bg-green-500' : value >= 12 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${(value / 20) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weaknesses */}
      {scoringData.weaknesses && scoringData.weaknesses.length > 0 && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-sm text-red-700 dark:text-red-300 mb-2">⚠️ Areas for Improvement:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {scoringData.weaknesses.map((weakness, idx) => (
              <li key={idx}>{weakness}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Fixes */}
      {scoringData.suggestedFixes && scoringData.suggestedFixes.length > 0 && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-2">💡 Suggested Improvements:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {scoringData.suggestedFixes.map((fix, idx) => (
              <li key={idx}>{fix}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
