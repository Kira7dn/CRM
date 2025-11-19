'use client'

import { useState, useTransition } from 'react'
import { createPostAction, updatePostAction } from '../actions'
import type { Post, Platform, ContentType, PostMedia } from '@/core/domain/post'
import { ImageUpload } from '@/app/(features)/_shared/components/ImageUpload'
import { Button } from '@shared/ui/button'
import { Label } from '@shared/ui/label'
import { Input } from '@shared/ui/input'
import { X, Plus, Video } from 'lucide-react'

interface PostFormProps {
  post?: Post
  onClose?: () => void
}

const PLATFORMS: { value: Platform; label: string; color: string }[] = [
  { value: 'facebook', label: 'Facebook', color: 'bg-blue-600' },
  { value: 'tiktok', label: 'TikTok', color: 'bg-black' },
  { value: 'zalo', label: 'Zalo', color: 'bg-blue-500' },
  { value: 'youtube', label: 'YouTube', color: 'bg-red-600' },
]

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'post', label: 'Post' },
  { value: 'feed', label: 'Feed' },
  { value: 'reel', label: 'Reel' },
  { value: 'short', label: 'Short' },
  { value: 'video', label: 'Video' },
  { value: 'story', label: 'Story' },
]

export default function PostForm({ post, onClose }: PostFormProps) {
  const [pending, startTransition] = useTransition()
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(
    post?.platforms.map(p => p.platform) || []
  )
  const [contentType, setContentType] = useState<ContentType>(post?.contentType || 'post')
  const [media, setMedia] = useState<PostMedia[]>(post?.media || [])
  const [hashtags, setHashtags] = useState<string>(post?.hashtags.join(' ') || '')
  const [scheduledAt, setScheduledAt] = useState<string>(
    post?.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : ''
  )

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const addMedia = (url: string) => {
    const newMedia: PostMedia = {
      type: contentType === 'video' || contentType === 'reel' || contentType === 'short' ? 'video' : 'image',
      url,
      order: media.length,
    }
    setMedia(prev => [...prev, newMedia])
  }

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(formData: FormData) {
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform')
      return
    }

    formData.append('contentType', contentType)
    formData.append('platforms', JSON.stringify(selectedPlatforms))
    formData.append('media', JSON.stringify(media))
    formData.append('hashtags', hashtags)
    if (scheduledAt) {
      formData.append('scheduledAt', scheduledAt)
    }

    startTransition(async () => {
      if (post?.id) {
        await updatePostAction(post.id, formData)
      } else {
        await createPostAction(formData)
      }
      onClose?.()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg border">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{post ? 'Edit Post' : 'Create New Post'}</h2>
        {onClose && (
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          placeholder="Post title"
          defaultValue={post?.title}
          required
          maxLength={500}
        />
      </div>

      {/* Body */}
      <div className="space-y-2">
        <Label htmlFor="body">Content</Label>
        <textarea
          id="body"
          name="body"
          placeholder="Post content..."
          defaultValue={post?.body}
          rows={6}
          className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Content Type */}
      <div className="space-y-2">
        <Label>Content Type *</Label>
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setContentType(value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                contentType === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Platforms */}
      <div className="space-y-2">
        <Label>Platforms * (Select at least one)</Label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(({ value, label, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => togglePlatform(value)}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-all ${
                selectedPlatforms.includes(value)
                  ? `${color} scale-105`
                  : 'bg-gray-300 dark:bg-gray-600 opacity-60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Media */}
      <div className="space-y-2">
        <Label>Media</Label>
        <div className="grid grid-cols-2 gap-4">
          {media.map((m, i) => (
            <div key={i} className="relative border rounded-lg p-2">
              {m.type === 'video' ? (
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                  <Video className="h-8 w-8 text-gray-400" />
                </div>
              ) : (
                <img src={m.url} alt={`Media ${i + 1}`} className="w-full aspect-video object-cover rounded" />
              )}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1"
                onClick={() => removeMedia(i)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <div className="border-2 border-dashed rounded-lg p-4">
            <ImageUpload
              value=""
              onChange={addMedia}
              folder="posts"
              label=""
              maxSize={contentType === 'video' ? 500 : 10}
            />
          </div>
        </div>
      </div>

      {/* Hashtags */}
      <div className="space-y-2">
        <Label htmlFor="hashtags">Hashtags (space-separated, max 30)</Label>
        <Input
          id="hashtags"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="#seafood #coto #fresh"
        />
      </div>

      {/* Scheduled Date */}
      <div className="space-y-2">
        <Label htmlFor="scheduledAt">Schedule for later (optional)</Label>
        <Input
          id="scheduledAt"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
        </Button>
      </div>
    </form>
  )
}
