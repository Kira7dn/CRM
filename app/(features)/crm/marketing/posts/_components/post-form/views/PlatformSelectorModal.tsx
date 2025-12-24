'use client'

import { useCallback, ChangeEvent } from 'react'
import { Label } from '@shared/ui/label'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/@shared/ui/dialog'
import { usePostFormContext } from '../PostFormContext'
import PlatformMultiSelect from './PlatformMultiSelect'
import { datetimeLocalToUTC, utcToDatetimeLocal } from '@/lib/date-utils'

interface PlatformSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isSubmitting?: boolean
  submitButtonText: string
}

/**
 * PlatformSelectorModal - Modal for platform selection and scheduling before publishing
 *
 * Features:
 * - Shows current content type for context
 * - Multi-select dropdown with search for platforms
 * - Schedule datetime input (optional) - uses CRM Date Standard
 * - Selected platforms displayed as badges
 * - Validation error display
 * - Confirms selection before publishing
 */
export default function PlatformSelectorModal({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
  submitButtonText,
}: PlatformSelectorModalProps) {
  const { state, setField } = usePostFormContext()
  const { contentType, platforms, scheduledAt } = state

  const hasError = platforms?.length === 0
  const errorMessage = "Please select at least one platform"
  const isActionDisabled = isSubmitting || hasError

  // ===== Schedule Handler (CRM Standard) =====
  const handleScheduledAtChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (!value) {
        setField('scheduledAt', undefined)
        return
      }

      // Convert local datetime to UTC instant using standard util
      const isoString = datetimeLocalToUTC(value)
      setField('scheduledAt', isoString)
    },
    [setField]
  )

  // Display UTC as local datetime using standard util
  const scheduledAtValue = scheduledAt ? utcToDatetimeLocal(scheduledAt) : ''


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Target Platforms</DialogTitle>
          <DialogDescription>
            Choose which platforms you want to publish this{' '}
            <span className="font-medium capitalize">{contentType}</span> content to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Target Platforms *</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Platforms compatible with <span className="font-medium capitalize">{contentType}</span> content
            </p>

            {/* Multi-Select Dropdown */}
            <PlatformMultiSelect
              contentType={contentType}
              selectedPlatforms={platforms}
              onPlatformsChange={(platforms) => setField('platforms', platforms)}
            />
          </div>

          {/* Error Message */}
          {hasError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errorMessage}
            </p>
          )}

          {/* Schedule Input */}
          <div className="space-y-1">
            <Label htmlFor="scheduledAt">Schedule (optional)</Label>
            <Input
              type="datetime-local"
              id="scheduledAt"
              value={scheduledAtValue}
              onChange={handleScheduledAtChange}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to publish immediately
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isActionDisabled}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              submitButtonText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
