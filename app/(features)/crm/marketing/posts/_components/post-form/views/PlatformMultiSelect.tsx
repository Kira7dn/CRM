'use client'

import { useState } from 'react'
import { Check, ChevronDown, AlertTriangle, X } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover'
import { Command, CommandInput, CommandList, CommandGroup, CommandItem } from '@shared/ui/command'
import { cn } from '@/lib/utils'
import type { Platform, ContentType, PlatformMetadata } from '@/core/domain/marketing/post'
import {
  PLATFORMS,
  PLATFORM_COLORS,
  getPlatformCompatibility,
  getPlatformLabel,
} from './platform-utils'

interface PlatformMultiSelectProps {
  contentType: ContentType
  selectedPlatforms: PlatformMetadata[]
  onPlatformsChange: (platforms: PlatformMetadata[]) => void
  disabled?: boolean
}

/**
 * PlatformMultiSelect - Multi-select dropdown for platform selection
 *
 * Features:
 * - Dropdown with searchable platform list
 * - Checkbox-style selection
 * - Filters platforms by contentType compatibility
 * - Shows selected platforms as colored badges
 * - Warning icons for platforms with limited support
 * - Disabled state for unsupported platforms
 */
export default function PlatformMultiSelect({
  contentType,
  selectedPlatforms,
  onPlatformsChange,
  disabled = false,
}: PlatformMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectedPlatformValues = selectedPlatforms.map(p => p.platform)

  const togglePlatform = (platform: Platform) => {
    const compatibility = getPlatformCompatibility(platform, contentType)

    // Don't allow selecting unsupported platforms
    if (compatibility === 'unsupported') return

    const isSelected = selectedPlatformValues.includes(platform)

    if (isSelected) {
      // Remove platform
      onPlatformsChange(
        selectedPlatforms.filter(p => p.platform !== platform)
      )
    } else {
      // Add platform with default metadata
      onPlatformsChange([
        ...selectedPlatforms,
        {
          platform,
          status: "draft" as const,
        }
      ])
    }
  }

  const removePlatform = (platform: Platform) => {
    onPlatformsChange(
      selectedPlatforms.filter(p => p.platform !== platform)
    )
  }

  // Filter platforms by search query
  const filteredPlatforms = PLATFORMS.filter(p =>
    p.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-3">
      {/* Dropdown Trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
            type="button"
          >
            <span className="text-sm">
              {selectedPlatforms.length === 0
                ? 'Select platforms...'
                : `${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? 's' : ''} selected`}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search platforms..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandGroup>
                {filteredPlatforms.map((platform) => {
                  const compatibility = getPlatformCompatibility(platform.value, contentType)
                  const isSelected = selectedPlatformValues.includes(platform.value)
                  const isUnsupported = compatibility === 'unsupported'
                  const hasWarning = compatibility === 'warning'

                  return (
                    <CommandItem
                      key={platform.value}
                      onSelect={() => togglePlatform(platform.value)}
                      disabled={isUnsupported}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        isUnsupported && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {/* Checkbox - Custom implementation using div */}
                      <div className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border transition-colors",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-input"
                      )}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>

                      {/* Platform Name */}
                      <span className={cn(
                        "flex-1",
                        isUnsupported && "text-muted-foreground line-through"
                      )}>
                        {platform.label}
                      </span>

                      {/* Warning Icon */}
                      {hasWarning && !isUnsupported && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </CommandItem>
                  )
                })}

                {filteredPlatforms.length === 0 && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No platforms found
                  </div>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Platform Badges */}
      {selectedPlatforms.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedPlatforms.map((pm) => {
            const platformLabel = getPlatformLabel(pm.platform)
            const compatibility = getPlatformCompatibility(pm.platform, contentType)
            const colorClass = PLATFORM_COLORS[pm.platform] || 'bg-gray-600 text-white'

            return (
              <Badge
                key={pm.platform}
                className={cn(
                  "pl-2 pr-1 flex items-center gap-1.5",
                  colorClass
                )}
              >
                <span>{platformLabel}</span>

                {compatibility === 'warning' && (
                  <AlertTriangle className="h-3 w-3" />
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removePlatform(pm.platform)
                  }}
                  className="ml-0.5 rounded-sm hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
                  aria-label={`Remove ${platformLabel}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
