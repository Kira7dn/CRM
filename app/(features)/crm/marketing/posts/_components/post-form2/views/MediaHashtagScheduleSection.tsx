'use client'

import { memo, useCallback, ChangeEvent } from 'react'
import { Label } from '@shared/ui/label'
import { Input } from '@shared/ui/input'
import { MediaUpload } from '@/app/(features)/crm/_components/MediaUpload'
import { usePostFormContext } from '../PostFormContext'

function MediaHashtagScheduleSection() {
  const { state, setField } = usePostFormContext()

  const isVideoContent =
    state.contentType === 'video' || state.contentType === 'short'

  // ===== handlers =====

  const handleMediaChange = useCallback(
    (url: string | null) => {
      setField(
        'media',
        url
          ? {
            type: isVideoContent ? 'video' : 'image',
            url,
          }
          : null
      )
    },
    [isVideoContent, setField]
  )

  const handleHashtagsChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setField('hashtags', e.target.value)
    },
    [setField]
  )

  const handleScheduledAtChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setField('scheduledAt', value ? new Date(value) : undefined)
    },
    [setField]
  )

  // ===== helpers =====

  const scheduledAtValue = state.scheduledAt
    ? new Date(state.scheduledAt).toISOString().slice(0, 16)
    : ''

  return (
    <section className="space-y-4">
      {/* ===== Media ===== */}
      <div className="space-y-1">
        <Label>Media</Label>
        <MediaUpload
          value={state.media?.url}
          onChange={handleMediaChange}
          folder="posts"
          type={isVideoContent ? 'video' : 'image'}
          maxSize={isVideoContent ? 500 : 10}
        />
      </div>

      {/* ===== Hashtags ===== */}
      <div className="space-y-1">
        <Label htmlFor="hashtags">Hashtags (space-separated)</Label>
        <Input
          id="hashtags"
          value={state.hashtags}
          onChange={handleHashtagsChange}
          placeholder="#sale #promotion #summer"
        />
      </div>

      {/* ===== Schedule ===== */}
      <div className="space-y-1">
        <Label htmlFor="scheduledAt">Schedule (optional)</Label>
        <Input
          type="datetime-local"
          id="scheduledAt"
          value={scheduledAtValue}
          onChange={handleScheduledAtChange}
        />
      </div>
    </section>
  )
}

export default memo(MediaHashtagScheduleSection)
