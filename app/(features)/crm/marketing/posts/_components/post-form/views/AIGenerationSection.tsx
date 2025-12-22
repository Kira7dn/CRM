'use client'

import { useState, useMemo, useCallback, ChangeEvent } from 'react'
import { Loader2, BarChart3 } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { Label } from '@shared/ui/label'
import { Textarea } from '@shared/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/@shared/ui/tabs'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/@shared/ui/card'
import { usePostFormContext } from '../PostFormContext'
import { usePostStore } from '../../../_store/usePostStore'
import { streamMultiPassGeneration } from '../actions/stream-generate-action'
import { handleStreamEvents, generateSessionId } from './stream-event-handler'
import { scrollBodyTextareaToBottom } from './utils'
import { AlertBox, SectionContainer, LoadingState } from './shared-ui'
import InsightsTwoToneIcon from '@mui/icons-material/InsightsTwoTone';
import AutoAwesomeTwoToneIcon from '@mui/icons-material/AutoAwesomeTwoTone';
import AutoFixNormalTwoToneIcon from '@mui/icons-material/AutoFixNormalTwoTone';
import {
  type ScoreData,
  getScoreLabel,
  getScoreBadgeClass,
  getBreakdownBarClass,
  getBreakdownLabel,
  formatSuggestionsAsText,
} from './score-utils'

export default function AIGenerationSection() {
  const { state, setField, products } = usePostFormContext()
  const { brand } = usePostStore()

  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  // Quality Score state
  const [scoreData, setScoreData] = useState<ScoreData | null>(null)
  const [isScoring, setIsScoring] = useState(false)
  const [improveInstruction, setImproveInstruction] = useState('')
  const [isImproving, setIsImproving] = useState(false)
  const [improveProgress, setImproveProgress] = useState<string[]>([])

  // Generate session ID once
  const sessionId = useMemo(() => generateSessionId(), [])

  // Check if form has minimum required input
  const isDisabled = !state.idea && !state.product && !state.contentInstruction && !state.title

  // Event handlers for Post Idea and Product
  const onIdeaChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setField('idea', e.target.value)
    },
    [setField]
  )

  const onProductChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const productId = e.target.value
      const selectedProduct = products?.find(p => String(p.id) === productId)
      setField('product', selectedProduct || null)
    },
    [setField, products]
  )

  /**
   * Generic generation handler - eliminates duplication
   */
  const handleGeneration = async (action: 'singlepass' | 'multipass') => {
    setIsGenerating(true)
    setProgress([])
    setErrorMessage(undefined)

    try {
      const events = streamMultiPassGeneration({
        ...state,
        brand,
        sessionId,
        action,
      })

      await handleStreamEvents(events, {
        onTitleReady: (title) => setField('title', title),
        onHashtagsReady: (hashtags) => setField('hashtags', hashtags),
        onBodyToken: (_, accumulatedBody) => {
          setField('body', accumulatedBody)
          scrollBodyTextareaToBottom()
        },
        onProgress: (message) => setProgress((p) => [...p, message]),
        onError: (message) => {
          setErrorMessage(message)
          setProgress([])
        },
      })
    } catch (err) {
      console.error('Generation failed:', err)
      setErrorMessage('Generation failed. Please try again.')
    } finally {
      setIsGenerating(false)
      // Clear progress after completion
      if (!errorMessage) {
        setTimeout(() => setProgress([]), 2000)
      }
    }
  }

  /**
   * Score the current content
   */
  const handleScoreContent = async () => {
    const hasContent = Boolean(state.body || state.title)
    if (!hasContent) return

    setIsScoring(true)
    setErrorMessage(undefined)
    setScoreData(null)

    try {
      const events = await streamMultiPassGeneration({
        ...state,
        brand,
        sessionId: generateSessionId('score'),
        action: 'scoring',
      })

      for await (const event of events) {
        if (event.type === 'final' && event.result?.metadata) {
          const { score, scoreBreakdown, weaknesses, suggestedFixes } = event.result.metadata

          if (score && scoreBreakdown) {
            setScoreData({
              score,
              scoreBreakdown,
              weaknesses: weaknesses ?? [],
              suggestedFixes: suggestedFixes ?? [],
            })
            setImproveInstruction(formatSuggestionsAsText(suggestedFixes || []))
          }
        } else if (event.type === 'error') {
          setErrorMessage(event.message)
          break
        }
      }
    } catch (err) {
      console.error('Scoring failed:', err)
      setErrorMessage('Failed to score content. Please try again.')
    } finally {
      setIsScoring(false)
    }
  }

  /**
   * Submit improve request to AI
   */
  const handleSubmitImprove = async () => {
    if (!improveInstruction.trim()) return

    setIsImproving(true)
    setErrorMessage(undefined)
    setImproveProgress([])

    try {
      const events = await streamMultiPassGeneration({
        ...state,
        contentInstruction: improveInstruction,
        brand,
        sessionId: generateSessionId('improve'),
        action: 'improve',
      })

      await handleStreamEvents(events, {
        onTitleReady: (title) => setField('title', title),
        onHashtagsReady: (hashtags) => setField('hashtags', hashtags),
        onBodyToken: (_, accumulatedBody) => {
          setField('body', accumulatedBody)
          scrollBodyTextareaToBottom()
        },
        onProgress: (message) => setImproveProgress((p) => [...p, message]),
        onFinal: () => {
          setImproveInstruction('')
          setScoreData(null) // Reset score after improvement
        },
        onError: (message) => {
          setErrorMessage(message)
          setImproveProgress([])
        },
      })
    } catch (err) {
      console.error('Improve failed:', err)
      setErrorMessage('Failed to improve content. Please try again.')
    } finally {
      setIsImproving(false)
      // Clear progress after completion
      if (!errorMessage) {
        setTimeout(() => setImproveProgress([]), 2000)
      }
    }
  }

  return (
    <SectionContainer variant="purple" className='mt-0  lg:mt-3.5'>
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <AutoAwesomeTwoToneIcon className="text-purple-600" fontSize='medium' />
          <h3 className="font-semibold">AI Content Generation</h3>
        </div>
      </div>

      {/* Post Idea Input */}
      <div className="mb-4">
        <Label htmlFor="idea">Post Idea (from schedule or custom)</Label>
        <textarea
          id="idea"
          value={state.idea || ''}
          onChange={onIdeaChange}
          rows={2}
          placeholder="e.g., Highlight sustainable fishing practices..."
          className="w-full border rounded-md p-3"
        />
      </div>

      {/* Product Selection */}
      {products && products.length > 0 && (
        <div className="mb-4">
          <Label htmlFor="product">Product (optional)</Label>
          <select
            id="product"
            value={state.product?.id || ''}
            onChange={onProductChange}
            className="w-full border rounded-md p-2"
          >
            <option value="">None (no specific product)</option>
            {products.map((product: any) => (
              <option key={String(product.id)} value={String(product.id)}>
                {product.name}
              </option>
            ))}
          </select>
          {state.product?.url && (
            <p className="text-xs text-gray-500 mt-1">
              Product URL: <a href={state.product.url} target="_blank" rel="noopener noreferrer" className="underline">{state.product.url}</a>
            </p>
          )}
        </div>
      )}

      {/* Generation Mode Tabs */}
      <Tabs defaultValue="simple" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="simple" className="gap-2">
            <AutoFixNormalTwoToneIcon fontSize='small' />
            Simple
          </TabsTrigger>
          <TabsTrigger value="multipass" className="gap-2">
            <AutoAwesomeTwoToneIcon fontSize='small' />
            Multi-pass
          </TabsTrigger>
          <TabsTrigger value="quality" className="gap-2">
            <InsightsTwoToneIcon fontSize='small' />
            Score
          </TabsTrigger>
        </TabsList>

        {/* Simple Mode */}
        <TabsContent value="simple" className="mt-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AutoFixNormalTwoToneIcon className="h-5 w-5 text-purple-600" />
                Single-pass Generation
              </CardTitle>
              <CardDescription>
                Fast content generation in one pass.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                type="button"
                variant="default"
                onClick={() => handleGeneration('singlepass')}
                disabled={isGenerating || isDisabled}
                className="w-full gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <AutoFixNormalTwoToneIcon className="h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Multi-pass Mode */}
        <TabsContent value="multipass" className="mt-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AutoAwesomeTwoToneIcon fontSize='medium' className=" text-purple-600" />
                Multi-pass Generation
              </CardTitle>
              <CardDescription>
                5-stage process for premium quality content.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex-col gap-3">
              <Button
                type="button"
                variant="default"
                onClick={() => handleGeneration('multipass')}
                disabled={isGenerating || isDisabled}
                className="w-full gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {progress.length > 0 ? progress[progress.length - 1] : 'Processing...'}
                  </>
                ) : (
                  <>
                    <AutoAwesomeTwoToneIcon className="h-4 w-4" fontSize='medium' />
                    Generate with AI
                  </>
                )}
              </Button>

              {/* Progress indicator */}
              {progress.length > 0 && (
                <div className="w-full text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  {progress.slice(-3).map((step, idx) => (
                    <div key={idx} className="animate-in fade-in-50 duration-200">
                      {step}
                    </div>
                  ))}
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Quality Score Tab */}
        <TabsContent value="quality" className="mt-3">
          {!scoreData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <InsightsTwoToneIcon className="h-5 w-5 text-green-600" />
                  AI Quality Score
                </CardTitle>
                <CardDescription>
                  Analyze your content across 5 quality criteria
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  type="button"
                  onClick={handleScoreContent}
                  variant="default"
                  className="w-full gap-2"
                  disabled={(!state.body || !state.title) || isScoring}
                >
                  {isScoring ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Scoring...
                    </>
                  ) : (
                    <>
                      <InsightsTwoToneIcon className="h-4 w-4" />
                      Score Content
                    </>)
                  }
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader className="space-y-4">
                {/* Score Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold">Quality Score: {scoreData.score}/100</div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBadgeClass(scoreData.score)}`}>
                      {getScoreLabel(scoreData.score)}
                    </div>
                  </div>
                  <Button type="button" onClick={handleScoreContent} variant="outline" size="sm">
                    <InsightsTwoToneIcon className="h-4 w-4 mr-2" />
                    Re-score
                  </Button>
                </div>

                {/* Score Breakdown Grid */}
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(scoreData.scoreBreakdown).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">{value}/20</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 capitalize mt-1">
                        {getBreakdownLabel(key)}
                      </div>
                      <div className="mt-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getBreakdownBarClass(value)}`}
                          style={{ width: `${(value / 20) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Weaknesses */}
                {scoreData.weaknesses.length > 0 && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-sm text-red-700 dark:text-red-300 mb-2">
                      ⚠️ Areas for Improvement:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      {scoreData.weaknesses.map((weakness, idx) => (
                        <li key={idx}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Fixes */}
                {scoreData.suggestedFixes.length > 0 && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-2">
                      💡 Suggested Improvements:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      {scoreData.suggestedFixes.map((fix, idx) => (
                        <li key={idx}>{fix}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improve Section */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <h4 className="font-medium text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
                    <AutoAwesomeTwoToneIcon className="h-4 w-4" />
                    Customize Improvement Instructions
                  </h4>

                  <Textarea
                    value={improveInstruction}
                    onChange={(e) => setImproveInstruction(e.target.value)}
                    placeholder="Edit or add improvement instructions..."
                    className="min-h-30 text-sm"
                    disabled={isImproving}
                  />

                  {/* Progress Indicator */}
                  {improveProgress.length > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      {improveProgress.slice(-3).map((step, idx) => (
                        <div key={idx} className="animate-in fade-in-50 duration-200">
                          {step}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      AI will regenerate your content based on these instructions
                    </p>
                    <Button
                      type="button"
                      onClick={handleSubmitImprove}
                      variant="default"
                      size="sm"
                      disabled={!improveInstruction.trim() || isImproving}
                    >
                      {isImproving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {improveProgress.length > 0 ? improveProgress[improveProgress.length - 1] : 'Improving...'}
                        </>
                      ) : (
                        <>
                          <AutoAwesomeTwoToneIcon className="h-4 w-4 mr-2" />
                          Apply Improvements
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Error Message */}
      {errorMessage && <AlertBox message={errorMessage} variant="warning" className="mt-3" />}
    </SectionContainer>
  )
}
