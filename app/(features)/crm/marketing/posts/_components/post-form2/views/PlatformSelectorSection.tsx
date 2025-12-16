'use client'

import { Label } from '@shared/ui/label'
import { AlertTriangle } from 'lucide-react'
import type { Platform, ContentType } from '@/core/domain/marketing/post'
import type { PlatformSelectorViewModel } from '../postForm.selectors'
import type { PlatformSelectorEvents } from '../_hook/usePostFormMachine'

// Platform options
const PLATFORMS: { value: Platform; label: string; color: string }[] = [
  { value: 'facebook', label: 'Facebook', color: 'bg-blue-600' },
  { value: 'youtube', label: 'YouTube', color: 'bg-red-600' },
  { value: 'tiktok', label: 'TikTok', color: 'bg-black' },
  { value: 'zalo', label: 'Zalo', color: 'bg-blue-400' },
  { value: 'wordpress', label: 'WordPress', color: 'bg-[#21759B]' },
  { value: 'instagram', label: 'Instagram', color: 'bg-pink-600' },
]

// Content types
const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'short', label: 'Reel / Shorts' },
  { value: 'post', label: 'Photo Post' },
  { value: 'video', label: 'Video dài (>60s)' },
  { value: 'story', label: 'Story' },
]

// Compatibility mapping
const CONTENT_PLATFORM_MAP: Record<ContentType, Record<Platform, "supported" | "warning" | "unsupported">> = {
  short: {
    facebook: "supported",
    youtube: "supported",
    tiktok: "supported",
    zalo: "unsupported",
    website: "unsupported",
    telegram: "unsupported",
    wordpress: "unsupported",
    instagram: "supported"
  },
  post: {
    facebook: "supported",
    youtube: "unsupported",
    tiktok: "warning",
    zalo: "supported",
    website: "supported",
    telegram: "supported",
    wordpress: "supported",
    instagram: "supported"
  },
  video: {
    facebook: "supported",
    youtube: "supported",
    tiktok: "unsupported",
    zalo: "unsupported",
    website: "supported",
    telegram: "unsupported",
    wordpress: "warning",
    instagram: "supported"
  },
  story: {
    facebook: "supported",
    youtube: "unsupported",
    tiktok: "supported",
    zalo: "unsupported",
    website: "unsupported",
    telegram: "unsupported",
    wordpress: "unsupported",
    instagram: "supported"
  },
}

/**
 * PlatformSelectorSection Props
 *
 * Standard ViewModel + Events pattern
 */
export interface PlatformSelectorSectionProps {
  viewModel: PlatformSelectorViewModel
  events: PlatformSelectorEvents
}

/**
 * PlatformSelectorSection - Pure UI Component
 *
 * Responsibilities:
 * - Render content type selector
 * - Render platform selector with compatibility
 * - Show validation errors
 *
 * Does NOT:
 * - Manage state
 * - Know about workflow
 * - Handle complex business logic
 */
export default function PlatformSelectorSection({
  viewModel,
  events
}: PlatformSelectorSectionProps) {
  const { contentType, selectedPlatforms, isDisabled, hasError, errorMessage } = viewModel
  const { onChangeContentType, onTogglePlatform } = events

  const getPlatformSupport = (platform: Platform) =>
    CONTENT_PLATFORM_MAP[contentType as ContentType]?.[platform] || 'unsupported'

  const handleTogglePlatform = (platform: Platform) => {
    if (getPlatformSupport(platform) !== "supported") return
    onTogglePlatform(platform)
  }

  return (
    <>
      {/* Content Type */}
      <div>
        <Label>Content Type *</Label>
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map(ct => (
            <button
              key={ct.value}
              type="button"
              disabled={isDisabled}
              onClick={() => onChangeContentType(ct.value)}
              className={`px-4 py-2 rounded-md border transition-colors
                ${contentType === ct.value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-gray-100 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {ct.label}
            </button>
          ))}
        </div>
      </div>

      {/* Platforms */}
      <div>
        <Label>Supported Platforms *</Label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(p => {
            const support = getPlatformSupport(p.value)
            const isUnsupported = support === "unsupported"
            const isSelected = selectedPlatforms.includes(p.value)
            const hasWarning = support === "warning"

            return (
              <button
                key={p.value}
                type="button"
                disabled={isUnsupported || isDisabled}
                onClick={() => handleTogglePlatform(p.value)}
                className={`px-4 py-2 rounded-md text-white flex items-center gap-1 transition-opacity
                  ${isUnsupported
                    ? 'bg-gray-300 opacity-50 cursor-not-allowed'
                    : isSelected
                      ? p.color
                      : 'bg-gray-500 hover:opacity-80'
                  }
                  ${hasWarning ? 'border-2 border-yellow-400' : ''}
                  ${isDisabled && !isUnsupported ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {p.label}
                {hasWarning && <AlertTriangle className="h-4 w-4 text-yellow-300" />}
              </button>
            )
          })}
        </div>
        {hasError && errorMessage && (
          <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
        )}
      </div>
    </>
  )
}
