'use client'

import { Button } from '@shared/ui/button'
import { Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePostFormContext } from '../PostFormContext'

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
 *
 * Layout: Two-column responsive design
 * - Desktop: Left (60%) = Form Fields, Right (40%) = AI Tools + Actions (sticky)
 * - Mobile: Stacked - AI Tools → Form Fields → Actions
 */
export default function PostFormView() {
  const router = useRouter()
  const {
    state,
    post,
    actions,
    isDirty,
    isSubmitting,
  } = usePostFormContext()

  const hasPlatformError = state.platforms.length === 0

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    actions.submit()
  }

  const handleCancel = () => {
    if (isDirty) {
      if (confirm('Bạn có thay đổi chưa được lưu. Bạn có chắc muốn rời đi?')) {
        router.push('/crm/marketing/posts')
      }
    } else {
      router.push('/crm/marketing/posts')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white dark:bg-gray-800 rounded-lg border"
    >
      {/* ===== Header - Full Width ===== */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">
            {post ? 'Edit Post' : 'Create New Post'}
          </h2>

          {isDirty && !post && (
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              • Unsaved changes
            </span>
          )}
        </div>
        {/* Actions - Sticky at bottom of right column */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 bg-white dark:bg-gray-800">
          <div className="flex gap-2">
            {post && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => actions.delete()}
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
                onClick={() => actions.saveDraft()}
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
              onClick={handleCancel}
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
        </div>
      </header>

      {/* ===== Two Column Layout ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">

        {/* ===== LEFT COLUMN - Form Fields (60%) ===== */}
        <div className="space-y-6 order-2 lg:order-1">
          {/* Content Input - Idea, Product, Title, Body */}
          <ContentInputSection />

          {/* Media / Hashtag / Schedule - MOVED UP */}
          {/* Media upload auto-detects content type */}
          <MediaHashtagScheduleSection />

          {/* Platform Selector - MOVED DOWN */}
          {/* Platforms filtered by content type from media */}
          <PlatformSelector />
        </div>

        {/* ===== RIGHT COLUMN - AI Tools + Actions (40%) ===== */}
        <div className="order-1 lg:order-2 lg:top-6 lg:self-start flex flex-col">
          {/* AI Tools Container - Scrollable */}
          <div className="ai-tools-scroll space-y-6 lg:overflow-y-auto lg:pr-2">
            {/* AI Generation */}
            <AIGenerationSection />

            {/* Quality Score */}
            <QualityScoreDisplay />
          </div>


        </div>
      </div>
    </form>
  )
}
