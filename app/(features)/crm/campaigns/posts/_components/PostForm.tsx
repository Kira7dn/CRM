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
import { Button } from '@shared/ui/button'
import { Loader2, CheckCircle2, XCircle, Zap } from 'lucide-react'

// Extracted components
import AIGenerationSection from './form-sections/AIGenerationSection'
import QualityScoreDisplay from './form-sections/QualityScoreDisplay'
import ContentInputFields from './form-sections/ContentInputFields'
import PlatformSelector from './form-sections/PlatformSelector'
import MediaHashtagSchedule from './form-sections/MediaHashtagSchedule'

interface PostFormProps {
  post?: Post
  onClose?: () => void
  initialScheduledAt?: Date
  initialIdea?: string // NEW: Pre-fill from schedule
  registerHandleClose?: (handler: () => Promise<void>) => void
}

export default function PostForm({
  post,
  onClose,
  initialScheduledAt,
  initialIdea,
  registerHandleClose
}: PostFormProps) {
  const [isSubmitting, startTransition] = useTransition()
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(post?.platforms.map(p => p.platform) || [])
  const [contentType, setContentType] = useState<ContentType>(post?.contentType || 'post')
  const [media, setMedia] = useState<PostMedia | null>(post?.media?.[0] || null)
  const [hashtags, setHashtags] = useState(post?.hashtags?.join(' ') || '')

  // Helper to format date for datetime-local input
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

  // NEW FIELDS for Tasks 186-188
  const [idea, setIdea] = useState(initialIdea || '')
  const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string; url?: string } | null>(null)
  const [products, setProducts] = useState<Array<{ id: number; name: string; url?: string }>>([])
  const [detailContentsInstruction, setDetailContentsInstruction] = useState('')

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

  // Load brand memory status and products on mount
  useEffect(() => {
    const checkBrandMemory = async () => {
      const result = await getBrandMemoryAction()
      setHasBrandMemory(result.success && !!result.brandMemory)
    }
    checkBrandMemory()

    // Load products for dropdown
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        setProducts(data.map((p: any) => ({
          id: p.id,
          name: p.name,
          url: p.url
        })))
      } catch (error) {
        console.error('Failed to load products:', error)
      }
    }
    loadProducts()
  }, [])

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

  // UPDATED: Task 189 - Pass idea, product, detailInstruction to generation
  const handleGenerateAI = async () => {
    setIsGenerating(true)
    setSimilarityWarning(null)
    setGenerationProgress([])

    try {
      if (generationMode === 'multi-pass') {
        setGenerationProgress(['🤔 Generating ideas...'])

        const result = await generatePostMultiPassAction({
          topic: title || idea || undefined, // Use idea if no title
          platform: selectedPlatforms[0],
          idea: idea || undefined, // NEW
          productUrl: selectedProduct?.url, // NEW
          detailInstruction: detailContentsInstruction || undefined, // NEW
        })

        if (result.success) {
          setTitle(result.title || '')
          setBody(result.content || '')

          if (result.metadata?.passesCompleted) {
            setGenerationProgress(result.metadata.passesCompleted.map(pass =>
              `✓ ${pass.charAt(0).toUpperCase() + pass.slice(1)} pass completed`
            ))
          }

          if (result.metadata?.score) {
            setScoringData({
              score: result.metadata.score,
              scoreBreakdown: result.metadata.scoreBreakdown,
              weaknesses: result.metadata.weaknesses,
              suggestedFixes: result.metadata.suggestedFixes,
            })
          }

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
          topic: title || idea || undefined,
          platform: selectedPlatforms[0],
          idea: idea || undefined, // NEW
          productUrl: selectedProduct?.url, // NEW
          detailInstruction: detailContentsInstruction || undefined, // NEW
        })

        if (result.success && result.content) {
          setTitle(result.content.title)
          setBody(result.content.content)
          setVariations(result.content.variations)

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
          toast.dismiss(loadingToast)

          if (saveAsDraft) {
            toast.success('Draft saved successfully', {
              description: 'You can continue editing later',
            })
            onClose?.()
            return
          }

          // Store embedding for similarity check
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
    if (!post && hasUnsavedChanges && hasContent()) {
      const shouldSave = confirm('You have unsaved changes. Save as draft before closing?')
      if (shouldSave) {
        await handleSaveDraft()
      }
    }
    onClose?.()
  }

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

      {/* AI Generation Section */}
      <AIGenerationSection
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        hasBrandMemory={hasBrandMemory}
        generationMode={generationMode}
        setGenerationMode={setGenerationMode}
        generationProgress={generationProgress}
        similarityWarning={similarityWarning}
        handleGenerateAI={handleGenerateAI}
        isGenerating={isGenerating}
      />

      {/* Quality Score Display */}
      <QualityScoreDisplay scoringData={scoringData} />

      {/* Content Input Fields (includes NEW fields: idea, product, detailInstruction) */}
      <ContentInputFields
        title={title}
        setTitle={setTitle}
        body={body}
        setBody={setBody}
        variations={variations}
        setVariations={setVariations}
        idea={idea}
        setIdea={setIdea}
        detailContentsInstruction={detailContentsInstruction}
        setDetailContentsInstruction={setDetailContentsInstruction}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        products={products}
      />

      {/* Platform Selector */}
      <PlatformSelector
        contentType={contentType}
        setContentType={setContentType}
        selectedPlatforms={selectedPlatforms}
        setSelectedPlatforms={setSelectedPlatforms}
        errors={errors}
      />

      {/* Media, Hashtags, Schedule */}
      <MediaHashtagSchedule
        media={media}
        setMedia={setMedia}
        isVideoContent={isVideoContent}
        hashtags={hashtags}
        setHashtags={setHashtags}
        scheduledAt={scheduledAt}
        setScheduledAt={setScheduledAt}
      />

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
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" /> Saving...
              </>
            ) : (
              post ? 'Update Post' : scheduledAt ? 'Schedule Post' : 'Publish Now'
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
