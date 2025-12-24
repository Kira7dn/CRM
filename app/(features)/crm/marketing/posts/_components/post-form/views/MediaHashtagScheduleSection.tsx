'use client'

import { memo, useCallback, ChangeEvent } from 'react'
import { Label } from '@shared/ui/label'
import { Input } from '@shared/ui/input'
import { MediaUpload } from '@/app/(features)/crm/_components/MediaUpload'
import { usePostFormContext } from '../PostFormContext'
import { cn } from '@/lib/utils'
import type { PostMedia } from '@/core/domain/marketing/post'
import { autoDetectContentType, filterCompatiblePlatforms } from './platform-utils'

/**
 * MediaHashtagScheduleSection - Media upload and hashtags
 *
 * Features:
 * - Auto-detects content type from uploaded media (image → 'post', video → 'short')
 * - Adaptive media box sizing (small when empty, expand when filled)
 * - Hashtags input with space-separated format
 * - Filters incompatible platforms when content type changes
 *
 * Note: Schedule input has been moved to PlatformSelectorModal
 */
function MediaHashtagScheduleSection() {
  const { state, setField, post } = usePostFormContext()

  // ===== Media Upload Handler with Auto-Detection =====

  const handleMediaChange = useCallback(
    (media: PostMedia | null) => {
      // Set media
      setField('media', media)

      if (media) {
        // Only auto-detect content type for NEW posts (not edits)
        if (!post) {
          // Auto-detect content type from media type
          const newContentType = autoDetectContentType(`${media.type}/`)
          setField('contentType', newContentType)

          // Filter out incompatible platforms
          const compatiblePlatforms = filterCompatiblePlatforms(
            state.platforms,
            newContentType
          )

          // Update platforms if any were filtered out
          if (compatiblePlatforms.length !== state.platforms.length) {
            setField('platforms', compatiblePlatforms)

            // Optional: Log removed platforms for debugging
            const removedCount = state.platforms.length - compatiblePlatforms.length
            if (removedCount > 0) {
              console.log(`Removed ${removedCount} incompatible platform(s) after content type change to '${newContentType}'`)
            }
          }
        }
      } else {
        // Media removed - reset to default content type
        setField('contentType', 'post')
      }
    },
    [post, state.platforms, setField]
  )

  // ===== Hashtags Handler =====

  const handleHashtagsChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setField('hashtags', e.target.value)
    },
    [setField]
  )

  return (
    <section className="space-y-4">
      {/* ===== Media - Adaptive Height ===== */}
      <div className="space-y-1">
        <Label>Media</Label>
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          state.media && "min-h-64" // Expanded when media present (16rem)
        )}>
          <MediaUpload
            value={state.media}
            onChange={handleMediaChange}
            folder="posts"
            maxSize={200} // Max size handled internally by MediaUpload
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Upload image for posts or video for shorts/reels
        </p>
      </div>

      {/* ===== Hashtags ===== */}
      <div className="space-y-1">
        <Label htmlFor="hashtags">Hashtags</Label>
        <Input
          id="hashtags"
          value={state.hashtags}
          onChange={handleHashtagsChange}
          placeholder="#seafood #fresh #cotoisland"
        />
        <p className="text-xs text-muted-foreground">
          Space-separated hashtags
        </p>
      </div>
    </section>
  )
}

export default memo(MediaHashtagScheduleSection)
