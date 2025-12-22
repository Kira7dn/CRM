'use client'

import { memo, useCallback, ChangeEvent } from 'react'
import { Label } from '@shared/ui/label'
import { Input } from '@shared/ui/input'
import { Button } from '@shared/ui/button'
import { Sparkles } from 'lucide-react'
import { usePostFormContext } from '../PostFormContext'

/**
 * ContentInputSection - OPTIMIZED with React.memo & useCallback
 *
 * ✅ OPTIMIZATIONS:
 * 1. Wrapped with React.memo
 * 2. useCallback for inline event handlers
 * 3. Stable event references
 */
function ContentInputSection() {
  const { state, setField } = usePostFormContext()

  const onTitleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setField('title', e.target.value)
    },
    [setField]
  )

  const onBodyChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setField('body', e.target.value)
    },
    [setField]
  )

  const onVariationSelect = useCallback(
    (title: string, content: string) => {
      setField('title', title)
      setField('body', content)
    },
    [setField]
  )

  const onHideVariations = useCallback(
    () => {
      setField('variations', [])
    },
    [setField]
  )

  return (
    <>
      {/* Title */}
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          required
          value={state.title}
          onChange={onTitleChange}
        />
      </div>

      {/* Content Body */}
      <div>
        <Label htmlFor="body">Content</Label>
        <textarea
          id="body"
          name="body"
          rows={6}
          value={state.body}
          onChange={onBodyChange}
          className="w-full border rounded-md p-3"
        />
      </div>

      {/* Variations Selector */}
      {state.variations && state.variations.length > 0 && (
        <div className="border rounded-lg p-4 space-y-3 bg-blue-50 dark:bg-blue-900/10">
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Generated Variations
          </h3>
          <div className="space-y-2">
            {state.variations.map((variation: any, index: number) => (
              <VariationButton
                key={index}
                variation={variation}
                onSelect={onVariationSelect}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onHideVariations}
          >
            Hide Variations
          </Button>
        </div>
      )}
    </>
  )
}

/**
 * ✅ OPTIMIZATION: Extract VariationButton as separate memoized component
 * Prevents re-rendering all variations when one is clicked
 */
const VariationButton = memo(function VariationButton({
  variation,
  onSelect
}: {
  variation: { title: string; body: string; style: string }
  onSelect: (title: string, body: string) => void
}) {
  const handleClick = useCallback(() => {
    onSelect(variation.title, variation.body)
  }, [variation.title, variation.body, onSelect])

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full text-left p-3 border rounded-md hover:bg-white dark:hover:bg-gray-800 bg-white dark:bg-gray-900 transition-colors"
    >
      <div className="font-medium text-xs text-gray-500 uppercase mb-1">
        {variation.style}
      </div>
      <div className="font-semibold text-sm mb-1">{variation.title}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
        {variation.body}
      </div>
    </button>
  )
})

/**
 * ✅ OPTIMIZATION: Export memoized component
 */
export default memo(ContentInputSection)
