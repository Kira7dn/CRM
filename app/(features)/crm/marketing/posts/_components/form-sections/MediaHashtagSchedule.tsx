'use client'

import { Label } from '@shared/ui/label'
import { Input } from '@shared/ui/input'
import { MediaUpload } from '@/app/(features)/crm/_components/MediaUpload'
import type { PostMedia } from '@/core/domain/marketing/post'

interface MediaHashtagScheduleProps {
  media: PostMedia | null
  setMedia: (media: PostMedia | null) => void
  isVideoContent: boolean
  hashtags: string
  setHashtags: (hashtags: string) => void
  scheduledAt: string
  setScheduledAt: (scheduledAt: string) => void
}

export default function MediaHashtagSchedule({
  media,
  setMedia,
  isVideoContent,
  hashtags,
  setHashtags,
  scheduledAt,
  setScheduledAt,
}: MediaHashtagScheduleProps) {
  return (
    <>
      {/* Media */}
      <div>
        <Label>Media</Label>
        <MediaUpload
          value={media?.url}
          onChange={(url) => setMedia(url ? { type: isVideoContent ? 'video' : 'image', url } : null)}
          folder="posts"
          type={isVideoContent ? "video" : "image"}
          maxSize={isVideoContent ? 500 : 10}
        />
      </div>

      {/* Hashtags */}
      <div>
        <Label htmlFor="hashtags">Hashtags (space-separated)</Label>
        <Input id="hashtags" value={hashtags} onChange={(e) => setHashtags(e.target.value)} />
      </div>

      {/* Schedule */}
      <div>
        <Label htmlFor="scheduledAt">Schedule (optional)</Label>
        <Input
          type="datetime-local"
          id="scheduledAt"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
      </div>
    </>
  )
}
