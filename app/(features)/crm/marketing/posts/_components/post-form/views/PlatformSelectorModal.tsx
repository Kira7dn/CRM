'use client'

import { Label } from '@shared/ui/label'
import { Button } from '@shared/ui/button'
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

interface PlatformSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isSubmitting?: boolean
  submitButtonText: string
}

/**
 * PlatformSelectorModal - Modal for platform selection before publishing
 *
 * Features:
 * - Shows current content type for context
 * - Multi-select dropdown with search
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
  const { contentType, platforms } = state

  const hasError = platforms.length === 0
  const errorMessage = "Please select at least one platform"
  const isActionDisabled = isSubmitting || hasError

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
