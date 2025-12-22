'use client'

import { useState } from 'react'
import { Button } from '@shared/ui/button'
import { Trash2 } from 'lucide-react'
import { usePostFormContext } from '../PostFormContext'
import { usePostStore } from '../../../_store/usePostStore'

// Sections
import AIGenerationSection from './AIGenerationSection'
import MediaHashtagScheduleSection from './MediaHashtagScheduleSection'
import ContentInputSection from './ContentInputSection'
import PlatformSelectorModal from './PlatformSelectorModal'

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
  const [showPlatformModal, setShowPlatformModal] = useState(false)
  const { closePostFormModal } = usePostStore()

  const {
    state,
    post,
    actions,
    isSubmitting,
  } = usePostFormContext()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Show platform selector modal instead of submitting directly
    setShowPlatformModal(true)
  }

  const handleConfirmSubmit = async () => {
    try {
      await actions.submit()
      // Close modal after successful submit
      setShowPlatformModal(false)
      closePostFormModal(true) // Force close without dirty check
    } catch (error) {
      // Error toast already handled by store
      console.error('[PostForm] Submit failed:', error)
    }
  }

  const handleSaveDraft = async () => {
    try {
      await actions.saveDraft()
      // Close modal after successful save
      closePostFormModal(true) // Force close without dirty check
    } catch (error) {
      console.error('[PostForm] Save draft failed:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      await actions.delete()
      // Close modal after successful delete
      closePostFormModal(true) // Force close without dirty check
    } catch (error) {
      console.error('[PostForm] Delete failed:', error)
    }
  }

  const isActionDisabled = isSubmitting

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full overflow-hidden"
    >
      {/* ===== Header - Compact and Clean ===== */}
      <header className="shrink-0 pb-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {post ? 'Edit Post' : 'Create New Post'}
          </h2>
        </div>
      </header>

      {/* ===== Main Content - Scrollable ===== */}
      <div className="flex-1 overflow-y-auto py-6">
        {/* ===== Two Column Layout ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">

          {/* ===== LEFT COLUMN - Form Fields (60%) ===== */}
          <div className="space-y-6 order-2 lg:order-1">
            {/* Content Input - Idea, Product, Title, Body */}
            <ContentInputSection />

            {/* Media / Hashtag / Schedule - MOVED UP */}
            {/* Media upload auto-detects content type */}
            <MediaHashtagScheduleSection />
          </div>

          {/* ===== RIGHT COLUMN - AI Tools + Actions (40%) ===== */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-0 flex flex-col gap-6">
            {/* AI Tools Container - Scrollable */}
            <div className="space-y-6">
              {/* AI Generation with Quality Score integrated */}
              <AIGenerationSection />
            </div>
          </div>
        </div>
      </div>

      {/* ===== Footer Actions - Sticky Bottom ===== */}
      <footer className="shrink-0 pt-4 border-t bg-white dark:bg-gray-800 sticky bottom-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex gap-2">
            {post && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isActionDisabled}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}

            {!post && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isActionDisabled}
              >
                Save as Draft
              </Button>
            )}
          </div>

          <Button
            type="submit"
            disabled={isActionDisabled}
            className="sm:min-w-[140px]"
          >
            {post ? 'Update Post' : state.scheduledAt ? 'Schedule Post' : 'Publish Now'}
          </Button>
        </div>
      </footer>

      {/* Platform Selector Modal */}
      <PlatformSelectorModal
        open={showPlatformModal}
        onOpenChange={setShowPlatformModal}
        onConfirm={handleConfirmSubmit}
        isSubmitting={isSubmitting}
        submitButtonText={post ? 'Update Post' : state.scheduledAt ? 'Schedule Post' : 'Publish Now'}
      />
    </form>
  )
}
