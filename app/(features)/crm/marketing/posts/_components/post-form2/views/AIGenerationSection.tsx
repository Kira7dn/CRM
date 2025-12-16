'use client'

import { Button } from '@shared/ui/button'
import { Sparkles, Zap, Settings, Info, Loader2, AlertTriangle } from 'lucide-react'
import PostContentSettings from '../../PostContentSettings'
import type { AIGenerationViewModel } from '../postForm.selectors'
import type { AIGenerationEvents } from '../_hook/usePostFormMachine'

/**
 * AIGenerationSection Props
 *
 * Standard ViewModel + Events pattern:
 * - viewModel: All data needed for rendering
 * - events: All user interactions
 * - No workflow logic
 * - No machine coupling
 */
export interface AIGenerationSectionProps {
  viewModel: AIGenerationViewModel
  events: AIGenerationEvents
}

/**
 * AIGenerationSection - Pure UI Component
 *
 * Responsibilities:
 * - Render AI generation controls
 * - Display generation progress
 * - Show similarity warnings
 * - Toggle settings dialog
 *
 * Does NOT:
 * - Know about XState
 * - Handle async operations
 * - Manage workflow state
 */
export default function AIGenerationSection({
  viewModel,
  events
}: AIGenerationSectionProps) {
  const {
    mode,
    isGenerating,
    isDisabled,
    progress,
    similarityWarning,
    hasBrandMemory,
    showSettings
  } = viewModel

  const {
    onGenerate,
    onToggleSettings,
    onChangeMode
  } = events

  return (
    <div className="border rounded-lg p-4 bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold">AI Content Generation</h3>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleSettings}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          {hasBrandMemory ? 'Brand Configured' : 'Configure'}
        </Button>
      </div>

      {/* Brand Settings Dialog */}
      <PostContentSettings
        open={showSettings}
        onClose={() => {
          // Close settings by calling onToggleSettings
          onToggleSettings()
        }}
      />

      {/* Generation Mode Toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === 'simple' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChangeMode('simple')}
          className="flex-1 gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Simple (3-5s)
        </Button>
        <Button
          type="button"
          variant={mode === 'multi-pass' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChangeMode('multi-pass')}
          className="flex-1 gap-2"
        >
          <Zap className="h-4 w-4" />
          Multi-pass (15-25s)
        </Button>
      </div>

      {/* Generation Progress */}
      {progress.length > 0 && (
        <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
          {progress.map((progressItem, idx) => (
            <div key={idx}>{progressItem}</div>
          ))}
        </div>
      )}

      {/* Similarity Warning */}
      {similarityWarning && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            {similarityWarning}
          </div>
        </div>
      )}

      {/* Generate Button */}
      <Button
        type="button"
        variant="default"
        onClick={onGenerate}
        disabled={isGenerating || isDisabled}
        className="w-full gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating{mode === 'multi-pass' ? ' (Multi-pass)' : ''}...
          </>
        ) : (
          <>
            {mode === 'multi-pass' ? (
              <Zap className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate with AI
          </>
        )}
      </Button>

      {/* Disabled Hint */}
      {isDisabled && !isGenerating && (
        <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3 w-3 mt-0.5" />
          <div>Please select at least one platform before generating content</div>
        </div>
      )}

      {/* Info */}
      <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
        <Info className="h-3 w-3 mt-0.5" />
        <div>
          {mode === 'multi-pass'
            ? 'Multi-pass uses 5 stages (Idea → Angle → Outline → Draft → Enhance) for higher quality.'
            : 'Simple mode generates content quickly in one pass.'}
        </div>
      </div>
    </div>
  )
}
