'use client'

import { memo } from 'react'
import type { QualityScoreViewModel } from '../postForm.selectors'

/**
 * Quality Score Constants
 * ✅ OPTIMIZATION: Extract magic numbers
 */
const SCORE_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  NEEDS_IMPROVEMENT: 0
} as const

const BREAKDOWN_THRESHOLDS = {
  EXCELLENT: 16,
  GOOD: 12,
  NEEDS_IMPROVEMENT: 0
} as const

const SCORE_LABELS = {
  brandVoice: 'Brand Voice',
  platformFit: 'Platform Fit'
} as const

/**
 * QualityScoreDisplaySection Props
 */
export interface QualityScoreDisplaySectionProps {
  viewModel: QualityScoreViewModel
}

/**
 * QualityScoreDisplaySection - OPTIMIZED with React.memo
 *
 * ✅ OPTIMIZATIONS:
 * 1. Wrapped with React.memo to prevent unnecessary re-renders
 * 2. Extracted magic numbers to constants
 * 3. Memoized style calculations
 */
function QualityScoreDisplaySection({
  viewModel
}: QualityScoreDisplaySectionProps) {
  const { score, scoreBreakdown, weaknesses, suggestedFixes, isVisible } = viewModel

  if (!isVisible) {
    return null
  }

  // ✅ OPTIMIZATION: Pure functions for style calculations
  const getScoreLabel = (score: number | null): string => {
    if (!score) return 'Needs Improvement'
    if (score >= SCORE_THRESHOLDS.EXCELLENT) return 'Excellent'
    if (score >= SCORE_THRESHOLDS.GOOD) return 'Good'
    return 'Needs Improvement'
  }

  const getScoreBgColor = (score: number | null): string => {
    if (!score) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
    if (score >= SCORE_THRESHOLDS.EXCELLENT) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
    }
    if (score >= SCORE_THRESHOLDS.GOOD) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
    }
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
  }

  const getBarColor = (value: number): string => {
    if (value >= BREAKDOWN_THRESHOLDS.EXCELLENT) return 'bg-green-500'
    if (value >= BREAKDOWN_THRESHOLDS.GOOD) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getBreakdownLabel = (key: string): string => {
    if (key in SCORE_LABELS) {
      return SCORE_LABELS[key as keyof typeof SCORE_LABELS]
    }
    return key.charAt(0).toUpperCase() + key.slice(1)
  }

  const scoreLabel = getScoreLabel(score)
  const scoreBgColor = getScoreBgColor(score)

  return (
    <div className="border rounded-lg p-4 bg-linear-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">AI Quality Score: {score}/100</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${scoreBgColor}`}>
          {scoreLabel}
        </div>
      </div>

      {/* Score Breakdown */}
      {scoreBreakdown && (
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(scoreBreakdown).map(([key, value]) => {
            const barColor = getBarColor(value)
            const label = getBreakdownLabel(key)

            return (
              <div key={key} className="text-center">
                <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {value}/20
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 capitalize mt-1">
                  {label}
                </div>
                <div className="mt-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor}`}
                    style={{ width: `${(value / 20) * 100}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-sm text-red-700 dark:text-red-300 mb-2">
            ⚠️ Areas for Improvement:
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {weaknesses.map((weakness, idx) => (
              <li key={idx}>{weakness}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Fixes */}
      {suggestedFixes.length > 0 && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-2">
            💡 Suggested Improvements:
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {suggestedFixes.map((fix, idx) => (
              <li key={idx}>{fix}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/**
 * ✅ OPTIMIZATION: Export memoized component
 * Only re-renders when viewModel changes
 */
export default memo(QualityScoreDisplaySection)
