'use client'

import { Button } from '@shared/ui/button'
import { Loader2, Trash2 } from 'lucide-react'
import { usePostFormData } from '../PostFormContext'
// nếu bạn đã có hook actions riêng
// import { usePostFormActions } from './PostFormActions'

// Sections
import AIGenerationSection from './AIGenerationSection'
import QualityScoreDisplay from './QualityScoreDisplaySection'
import PlatformSelector from './PlatformSelectorSection'
import MediaHashtagScheduleSection from './MediaHashtagScheduleSection'
import ContentInputSection from './ContentInputSection'

/**
 * Pure presentational component for Post Form
 *
 * Rules:
 * - No props
 * - No business logic
 * - No async / side effects
 * - Only render based on context
 */
export default function PostFormView() {
  const {
    state,
    post,
    actions,
    isDirty,
    isSubmitting,
  } = usePostFormData()

  const hasPlatformError = state.platforms.length === 0

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    actions.submit()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg border"
    >
      {/* ===== Header ===== */}
      <header className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">
          {post ? 'Edit Post' : 'Create New Post'}
        </h2>

        {isDirty && !post && (
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
            • Unsaved changes
          </span>
        )}
      </header>

      {/* ===== AI Section ===== */}
      {/* <AIGenerationSection /> */}

      {/* ===== Quality Score ===== */}
      {/* <QualityScoreDisplay /> */}

      {/* ===== Content ===== */}
      <ContentInputSection />

      {/* ===== Platform ===== */}
      {/* <PlatformSelector hasError={hasPlatformError} /> */}

      {/* ===== Media / Hashtag / Schedule ===== */}
      <MediaHashtagScheduleSection />

      {/* ===== Actions ===== */}
      <footer className="flex items-center justify-between gap-2 pt-2">
        <div className="flex gap-2">
          {post && (
            <Button
              type="button"
              variant="destructive"
              // onClick={actions.delete}
              disabled={isSubmitting}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Xóa
            </Button>
          )}

          {!post && (
            <Button
              type="button"
              variant="outline"
              // onClick={actions.saveDraft}
              disabled={isSubmitting}
            >
              Save as Draft
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            // onClick={actions.close}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || hasPlatformError}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : post ? (
              'Update Post'
            ) : state.scheduledAt ? (
              'Schedule Post'
            ) : (
              'Publish Now'
            )}
          </Button>
        </div>
      </footer>
    </form>
  )
}
