'use client'

import { Label } from '@shared/ui/label'
import { AlertTriangle } from 'lucide-react'
import type { Platform, ContentType } from '@/core/domain/marketing/post'

// Platform options
const PLATFORMS: { value: Platform; label: string; color: string }[] = [
  { value: 'facebook', label: 'Facebook', color: 'bg-blue-600' },
  { value: 'youtube', label: 'YouTube', color: 'bg-red-600' },
  { value: 'tiktok', label: 'TikTok', color: 'bg-black' },
  { value: 'zalo', label: 'Zalo', color: 'bg-blue-400' },
  { value: 'wordpress', label: 'WordPress', color: 'bg-[#21759B]' },
]

// Content types
const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'reel', label: 'Reel / Shorts' },
  { value: 'post', label: 'Photo Post' },
  { value: 'video', label: 'Video dài (>60s)' },
  { value: 'article', label: 'Article / Bài viết dài' },
  { value: 'story', label: 'Story' },
]

// Compatibility mapping
const CONTENT_PLATFORM_MAP: Record<ContentType, Record<Platform, "supported" | "warning" | "unsupported">> = {
  reel: {
    facebook: "supported",
    youtube: "supported",
    tiktok: "supported",
    zalo: "unsupported",
    website: "unsupported",
    telegram: "unsupported",
    wordpress: "unsupported"
  },
  short: {
    facebook: "supported",
    youtube: "supported",
    tiktok: "supported",
    zalo: "unsupported",
    website: "unsupported",
    telegram: "unsupported",
    wordpress: "unsupported"
  },
  post: {
    facebook: "supported",
    youtube: "unsupported",
    tiktok: "warning",
    zalo: "supported",
    website: "supported",
    telegram: "supported",
    wordpress: "supported"
  },
  video: {
    facebook: "supported",
    youtube: "supported",
    tiktok: "unsupported",
    zalo: "unsupported",
    website: "supported",
    telegram: "unsupported",
    wordpress: "warning"
  },
  article: {
    facebook: "warning",
    youtube: "supported",
    tiktok: "unsupported",
    zalo: "supported",
    website: "supported",
    telegram: "supported",
    wordpress: "supported"
  },
  story: {
    facebook: "supported",
    youtube: "unsupported",
    tiktok: "supported",
    zalo: "unsupported",
    website: "unsupported",
    telegram: "unsupported",
    wordpress: "unsupported"
  },
}

interface PlatformSelectorProps {
  contentType: ContentType
  setContentType: (type: ContentType) => void
  selectedPlatforms: Platform[]
  setSelectedPlatforms: (platforms: Platform[]) => void
  errors?: Record<string, string>
}

export default function PlatformSelector({
  contentType,
  setContentType,
  selectedPlatforms,
  setSelectedPlatforms,
  errors = {},
}: PlatformSelectorProps) {
  const getPlatformSupport = (platform: Platform) =>
    CONTENT_PLATFORM_MAP[contentType]?.[platform] || 'unsupported'

  const togglePlatform = (platform: Platform) => {
    if (getPlatformSupport(platform) !== "supported") return
    setSelectedPlatforms(
      selectedPlatforms.includes(platform)
        ? selectedPlatforms.filter(p => p !== platform)
        : [...selectedPlatforms, platform]
    )
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
              onClick={() => setContentType(ct.value)}
              className={`px-4 py-2 rounded-md border
                ${contentType === ct.value ? 'bg-primary text-white' : 'bg-gray-200'}`}
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
            return (
              <button
                key={p.value}
                type="button"
                disabled={support === "unsupported"}
                onClick={() => togglePlatform(p.value)}
                className={`px-4 py-2 rounded-md text-white flex items-center gap-1
                  ${support === "unsupported" ? 'bg-gray-300 opacity-50 cursor-not-allowed' :
                    selectedPlatforms.includes(p.value) ? p.color : 'bg-gray-500'}
                  ${support === "warning" ? 'border-yellow-400 border' : ''}`}
              >
                {p.label}
                {support === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-300" />}
              </button>
            )
          })}
        </div>
        {errors.platforms && <p className="text-red-500 text-sm">{errors.platforms}</p>}
      </div>
    </>
  )
}
