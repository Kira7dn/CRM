'use client'

import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import {
  createPostAction,
  updatePostAction,
  generatePostContentAction,
  generatePostMultiPassAction,
  checkContentSimilarityAction,
  storeContentEmbeddingAction,
  getBrandMemoryAction
} from '../actions'
import type { Post, Platform, ContentType, PostMedia } from '@/core/domain/marketing/post'
import { MediaUpload } from '@/app/(features)/crm/_components/MediaUpload'
import { Button } from '@shared/ui/button'
import { Label } from '@shared/ui/label'
import { Input } from '@shared/ui/input'
import { Loader2, AlertTriangle, CheckCircle2, XCircle, Sparkles, Zap, Settings, Info } from 'lucide-react'
import PostContentSettings from './PostContentSettings'

// Platform options
const PLATFORMS: { value: Platform; label: string; color: string }[] = [
  { value: 'facebook', label: 'Facebook', color: 'bg-blue-600' },
  { value: 'youtube', label: 'YouTube', color: 'bg-red-600' },
  { value: 'tiktok', label: 'TikTok', color: 'bg-black' },
  { value: 'zalo', label: 'Zalo', color: 'bg-blue-400' },
]

// Content types
const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'reel', label: 'Reel / Shorts' },
  { value: 'post', label: 'Photo Post' },
  { value: 'video', label: 'Video dài (>60s)' },
  { value: 'article', label: 'Article / Bài viết dài' },
  { value: 'story', label: 'Story' }, // Thêm dòng này
]

// Compatibility mapping
const CONTENT_PLATFORM_MAP: Record<ContentType, Record<Platform, "supported" | "warning" | "unsupported">> = {
  reel: {
    facebook: "supported",
    youtube: "supported",
    tiktok: "supported",
    zalo: "unsupported",
    website: "unsupported",
    telegram: "unsupported"
  },
  short: {
    facebook: "supported",
    youtube: "supported",
    tiktok: "supported",
    zalo: "unsupported",
    website: "unsupported",
    telegram: "unsupported"
  },
  post: {
    facebook: "supported",
    youtube: "unsupported",
    tiktok: "warning",
    zalo: "supported",
    website: "supported",
    telegram: "supported"
  },
  video: {
    facebook: "supported",
    youtube: "supported",
    tiktok: "unsupported",
    zalo: "unsupported",
    website: "supported",
    telegram: "unsupported"
  },
  article: {
    facebook: "warning",
    youtube: "supported",
    tiktok: "unsupported",
    zalo: "supported",
    website: "supported",
    telegram: "supported"
  },
  story: {
    facebook: "supported",
    youtube: "unsupported",
    tiktok: "supported",
    zalo: "unsupported",
    website: "unsupported",
    telegram: "unsupported"
  },
}

interface PostFormProps {
  post?: Post
  onClose?: () => void
  initialScheduledAt?: Date
  registerHandleClose?: (handler: () => Promise<void>) => void // For Modal to intercept Dialog close
}

export default function PostForm({ post, onClose, initialScheduledAt, registerHandleClose }: PostFormProps) {
  const [isSubmitting, startTransition] = useTransition()
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(post?.platforms.map(p => p.platform) || [])
  const [contentType, setContentType] = useState<ContentType>(post?.contentType || 'post')
  const [media, setMedia] = useState<PostMedia | null>(post?.media?.[0] || null)
  const [hashtags, setHashtags] = useState(post?.hashtags?.join(' ') || '')
  // Helper to format date for datetime-local input (local timezone, not UTC)
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const [scheduledAt, setScheduledAt] = useState(
    post?.scheduledAt
      ? formatDateForInput(new Date(post.scheduledAt))
      : initialScheduledAt
        ? formatDateForInput(new Date(initialScheduledAt))
        : ''
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationMode, setGenerationMode] = useState<'simple' | 'multi-pass'>('multi-pass')
  const [generationProgress, setGenerationProgress] = useState<string[]>([])
  const [title, setTitle] = useState(post?.title || '')
  const [body, setBody] = useState(post?.body || '')
  const [variations, setVariations] = useState<Array<{ title: string; content: string; style: string }>>([])
  const [similarityWarning, setSimilarityWarning] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [hasBrandMemory, setHasBrandMemory] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [scoringData, setScoringData] = useState<{
    score?: number
    scoreBreakdown?: Record<string, number>
    weaknesses?: string[]
    suggestedFixes?: string[]
  } | null>(null)

  // Track if form has content
  const hasContent = () => {
    return title.trim().length > 0 || body.trim().length > 0
  }

  // Track changes
  useEffect(() => {
    if (!post && hasContent()) {
      setHasUnsavedChanges(true)
    }
  }, [title, body, post])

  // Load brand memory status on mount
  useEffect(() => {
    const checkBrandMemory = async () => {
      const result = await getBrandMemoryAction()
      setHasBrandMemory(result.success && !!result.brandMemory)
    }
    checkBrandMemory()
  }, [])

  const getPlatformSupport = (platform: Platform) =>
    CONTENT_PLATFORM_MAP[contentType]?.[platform] || 'unsupported'

  const togglePlatform = (platform: Platform) => {
    if (getPlatformSupport(platform) !== "supported") return
    setSelectedPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    )
  }

  const isVideoContent = ['video', 'reel', 'short'].includes(contentType)

  const handleCheckSimilarity = async (content: string, generatedTitle: string) => {
    try {
      const result = await checkContentSimilarityAction({
        content,
        title: generatedTitle,
        platform: selectedPlatforms[0],
        similarityThreshold: 0.85
      })

      if (result.success && result.isSimilar) {
        const warningMsg = 'warning' in result ? result.warning : 'Content is similar to existing posts'
        setSimilarityWarning(warningMsg || 'Content is similar to existing posts')
        return true
      }
      setSimilarityWarning(null)
      return false
    } catch (error) {
      console.error('Similarity check failed:', error)
      return false
    }
  }

  const handleGenerateAI = async () => {
    setIsGenerating(true)
    setSimilarityWarning(null)
    setGenerationProgress([])

    try {
      if (generationMode === 'multi-pass') {
        // Multi-pass generation with progress
        setGenerationProgress(['🤔 Generating ideas...'])

        const result = await generatePostMultiPassAction({
          topic: title || undefined,
          platform: selectedPlatforms[0]
        })

        if (result.success) {
          setTitle(result.title || '')
          setBody(result.content || '')

          // Show completed passes
          if (result.metadata?.passesCompleted) {
            setGenerationProgress(result.metadata.passesCompleted.map(pass =>
              `✓ ${pass.charAt(0).toUpperCase() + pass.slice(1)} pass completed`
            ))
          }

          // Store scoring data
          if (result.metadata?.score) {
            setScoringData({
              score: result.metadata.score,
              scoreBreakdown: result.metadata.scoreBreakdown,
              weaknesses: result.metadata.weaknesses,
              suggestedFixes: result.metadata.suggestedFixes,
            })
          }

          // Check similarity
          const isSimilar = await handleCheckSimilarity(result.content || '', result.title || '')

          const scoreInfo = result.metadata?.score
            ? ` | Quality Score: ${result.metadata.score}/100`
            : ''

          toast.success('High-quality content generated', {
            description: isSimilar
              ? '⚠️ Warning: Similar to existing content'
              : `Generated with ${result.metadata?.passesCompleted?.length || 5} passes${scoreInfo}`,
            icon: <Zap className="h-4 w-4" />
          })
        } else {
          throw new Error(result.error || 'Generation failed')
        }
      } else {
        // Simple single-pass generation
        const result = await generatePostContentAction({
          topic: title || undefined,
          platform: selectedPlatforms[0]
        })

        if (result.success && result.content) {
          setTitle(result.content.title)
          setBody(result.content.content)
          setVariations(result.content.variations)

          // Check similarity
          await handleCheckSimilarity(result.content.content, result.content.title)

          toast.success('Content generated successfully')
        } else {
          throw new Error(result.error || 'Generation failed')
        }
      }
    } catch (error) {
      toast.error('Failed to generate content', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (formData: FormData, saveAsDraft = false) => {
    // Validate only if not saving as draft
    if (!saveAsDraft && selectedPlatforms.length === 0) {
      setErrors({ platforms: 'Please select at least one platform' })
      return
    }
    setErrors({})

    formData.append('contentType', contentType)
    formData.append('platforms', JSON.stringify(selectedPlatforms))
    formData.append('media', JSON.stringify(media ? [media] : []))
    formData.append('hashtags', hashtags)
    formData.append('saveAsDraft', String(saveAsDraft))
    if (scheduledAt) formData.append('scheduledAt', scheduledAt)

    startTransition(async () => {
      try {
        // Show loading toast with appropriate message
        const loadingMessage = saveAsDraft
          ? 'Saving draft...'
          : scheduledAt
            ? 'Scheduling post...'
            : 'Publishing to platforms...'
        const loadingDescription = saveAsDraft
          ? 'Saving your draft'
          : `Uploading to ${selectedPlatforms.length} platform(s)`

        const loadingToast = toast.loading(loadingMessage, {
          description: loadingDescription,
        })

        if (post?.id) {
          await updatePostAction(post.id, formData)
          toast.success('Post updated successfully', { id: loadingToast })
        } else {
          const result = await createPostAction(formData)

          // Dismiss loading toast
          toast.dismiss(loadingToast)

          // Handle draft save
          if (saveAsDraft) {
            toast.success('Draft saved successfully', {
              description: 'You can continue editing later',
            })
            onClose?.()
            return
          }

          // Store embedding for similarity check in future (async, don't wait)
          if (result?.postId && body) {
            storeContentEmbeddingAction({
              postId: result.postId,
              content: body,
              title: title,
              platform: selectedPlatforms[0],
              topic: title
            }).catch(err => console.error('Failed to store embedding:', err))
          }

          // Show results for each platform
          if (result?.platformResults) {
            const successfulPlatforms = result.platformResults.filter(r => r.success)
            const failedPlatforms = result.platformResults.filter(r => !r.success)

            if (successfulPlatforms.length > 0) {
              successfulPlatforms.forEach(platform => {
                toast.success(`Published to ${platform.platform}`, {
                  description: platform.permalink ? (
                    <a href={platform.permalink} target="_blank" rel="noopener noreferrer" className="underline">
                      View post
                    </a>
                  ) : 'Post published successfully',
                  icon: <CheckCircle2 className="h-4 w-4" />,
                })
              })
            }

            if (failedPlatforms.length > 0) {
              failedPlatforms.forEach(platform => {
                toast.error(`Failed to publish to ${platform.platform}`, {
                  description: platform.error || 'Unknown error occurred',
                  icon: <XCircle className="h-4 w-4" />,
                })
              })
            }

            // Show summary
            if (result.platformResults.length > 1) {
              toast.info('Publishing Summary', {
                description: `${successfulPlatforms.length} succeeded, ${failedPlatforms.length} failed`,
              })
            }
          } else {
            toast.success('Post created successfully')
          }
        }

        setHasUnsavedChanges(false)
        onClose?.()
      } catch (error) {
        toast.error('Failed to save post', {
          description: error instanceof Error ? error.message : 'Unknown error occurred',
        })
      }
    })
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    handleSubmit(formData, false)
  }

  const handleSaveDraft = async () => {
    const form = document.querySelector('form') as HTMLFormElement
    if (form) {
      const formData = new FormData(form)
      await handleSubmit(formData, true)
      setHasUnsavedChanges(false)
    }
  }

  const handleClose = async () => {
    // Auto-save draft if has unsaved changes and content
    if (!post && hasUnsavedChanges && hasContent()) {
      const shouldSave = confirm('You have unsaved changes. Save as draft before closing?')
      if (shouldSave) {
        await handleSaveDraft()
      }
    }
    onClose?.()
  }

  // Register handleClose with Modal on mount
  useEffect(() => {
    if (registerHandleClose) {
      registerHandleClose(handleClose)
    }
  }, [registerHandleClose, hasUnsavedChanges, post])

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg border">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">{post ? 'Edit Post' : 'Create New Post'}</h2>
        {hasUnsavedChanges && !post && (
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            • Unsaved changes
          </span>
        )}
      </div>

      {/* AI Generate Section */}
      <div className="border rounded-lg p-4 bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold">AI Content Generation</h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            {hasBrandMemory ? 'Brand Configured' : 'Configure'}
          </Button>
        </div>

        {/* Brand Settings Dialog */}
        <PostContentSettings
          open={showSettings}
          onClose={() => setShowSettings(false)}
        />

        {/* Generation Mode Toggle */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={generationMode === 'simple' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGenerationMode('simple')}
            className="flex-1 gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Simple (3-5s)
          </Button>
          <Button
            type="button"
            variant={generationMode === 'multi-pass' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGenerationMode('multi-pass')}
            className="flex-1 gap-2"
          >
            <Zap className="h-4 w-4" />
            Multi-pass (15-25s)
          </Button>
        </div>

        {/* Generation Progress */}
        {generationProgress.length > 0 && (
          <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
            {generationProgress.map((progress, idx) => (
              <div key={idx}>{progress}</div>
            ))}
          </div>
        )}

        {/* Similarity Warning */}
        {similarityWarning && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              {similarityWarning}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button
          type="button"
          variant="default"
          onClick={handleGenerateAI}
          disabled={isGenerating}
          className="w-full gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating{generationMode === 'multi-pass' ? ' (Multi-pass)' : ''}...
            </>
          ) : (
            <>
              {generationMode === 'multi-pass' ? (
                <Zap className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate with AI
            </>
          )}
        </Button>

        {/* Info */}
        <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
          <Info className="h-3 w-3 mt-0.5" />
          <div>
            {generationMode === 'multi-pass'
              ? 'Multi-pass uses 5 stages (Idea → Angle → Outline → Draft → Enhance) for higher quality.'
              : 'Simple mode generates content quickly in one pass.'}
          </div>
        </div>
      </div>

      {/* Quality Score Display */}
      {scoringData && scoringData.score !== undefined && (
        <div className="border rounded-lg p-4 bg-linear-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">AI Quality Score: {scoringData.score}/100</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              scoringData.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
              scoringData.score >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
            }`}>
              {scoringData.score >= 80 ? 'Excellent' : scoringData.score >= 60 ? 'Good' : 'Needs Improvement'}
            </div>
          </div>

          {/* Score Breakdown */}
          {scoringData.scoreBreakdown && (
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(scoringData.scoreBreakdown).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">{value}/20</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 capitalize mt-1">
                    {key === 'brandVoice' ? 'Brand Voice' : key === 'platformFit' ? 'Platform Fit' : key}
                  </div>
                  <div className="mt-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${value >= 16 ? 'bg-green-500' : value >= 12 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${(value / 20) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Weaknesses */}
          {scoringData.weaknesses && scoringData.weaknesses.length > 0 && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-sm text-red-700 dark:text-red-300 mb-2">⚠️ Areas for Improvement:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {scoringData.weaknesses.map((weakness, idx) => (
                  <li key={idx}>{weakness}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Fixes */}
          {scoringData.suggestedFixes && scoringData.suggestedFixes.length > 0 && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-2">💡 Suggested Improvements:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {scoringData.suggestedFixes.map((fix, idx) => (
                  <li key={idx}>{fix}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Title */}
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Content Body */}
      <div>
        <Label htmlFor="body">Content</Label>
        <textarea
          id="body"
          name="body"
          rows={6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full border rounded-md p-3"
        />
      </div>

      {/* Variations Selector */}
      {variations.length > 0 && (
        <div className="border rounded-lg p-4 space-y-3 bg-blue-50 dark:bg-blue-900/10">
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Generated Variations
          </h3>
          <div className="space-y-2">
            {variations.map((variation, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setTitle(variation.title)
                  setBody(variation.content)
                }}
                className="w-full text-left p-3 border rounded-md hover:bg-white dark:hover:bg-gray-800 bg-white dark:bg-gray-900 transition-colors"
              >
                <div className="font-medium text-xs text-gray-500 uppercase mb-1">
                  {variation.style}
                </div>
                <div className="font-semibold text-sm mb-1">{variation.title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {variation.content}
                </div>
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setVariations([])}
          >
            Hide Variations
          </Button>
        </div>
      )}

      {/* Content Type */}
      <div>
        <Label>Content Type *</Label>
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map(ct => (
            <button key={ct.value} type="button" onClick={() => setContentType(ct.value)}
              className={`px-4 py-2 rounded-md border 
                ${contentType === ct.value ? 'bg-primary text-white' : 'bg-gray-200'}`}>
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
        <Input type="datetime-local" id="scheduledAt" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center gap-2">
        <div>
          {!post && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
            >
              Save as Draft
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {onClose && <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>}
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? <><Loader2 className="animate-spin" /> Saving...</> : post ? 'Update Post' : scheduledAt ? 'Schedule Post' : 'Publish Now'}
          </Button>
        </div>
      </div>
    </form>
  )
}
