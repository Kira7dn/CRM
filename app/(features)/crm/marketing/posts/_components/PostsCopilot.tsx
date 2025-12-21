'use client'

import { CopilotSidebar } from '@copilotkit/react-ui'
import { useCopilotAction, useCopilotReadable, useCopilotChatSuggestions } from '@copilotkit/react-core'
import { usePostStore } from '../_store/usePostStore'
import { usePostSettingStore } from '../_store/usePostSettingStore'
import { useGenerateSchedule } from '../_hooks/useGenerateSchedule'
import { useMemo } from 'react'

interface PostsCopilotProps {
  children: React.ReactNode
}

export function PostsCopilot({ children }: PostsCopilotProps) {
  const { posts } = usePostStore()
  const { brand, products } = usePostSettingStore()
  const { generateSchedule, saveSchedule, undoSchedule, hasPreview, previewCount } = useGenerateSchedule()

  // Make brand context readable to AI
  useCopilotReadable({
    description: 'Brand memory and content strategy',
    value: {
      brand: brand.brandDescription,
      niche: brand.niche,
      contentStyle: brand.contentStyle,
      language: brand.language,
      tone: brand.brandVoice.tone,
      selectedProductsCount: brand.selectedProductIds?.length || 0
    }
  })

  // Make posts context readable to AI
  useCopilotReadable({
    description: 'Current posts schedule and preview posts',
    value: {
      totalPosts: posts.length,
      previewCount,
      hasPreview
    }
  })

  // Define generatePostSchedule action
  useCopilotAction({
    name: 'generatePostSchedule',
    description: 'Generate 30-day post schedule with 20-30 content ideas based on brand memory. Use when user asks to "create post schedule", "generate schedule", "plan content".',
    parameters: [],
    handler: async () => {
      const schedule = await generateSchedule()
      return {
        success: true,
        message: `Created ${schedule.length} post ideas for the next 30 days. You can preview on calendar and click Save to save.`,
        count: schedule.length
      }
    }
  }, [generateSchedule])

  // Define saveSchedule action
  useCopilotAction({
    name: 'saveSchedule',
    description: 'Save the generated post schedule to database. Use when user asks to "save schedule", "save posts", "confirm schedule".',
    parameters: [],
    handler: async () => {
      const result = await saveSchedule()
      return {
        success: result.success,
        message: result.success
          ? `Successfully saved ${result.savedCount} posts to database. The schedule is now active.`
          : 'No schedule to save. Please generate a schedule first.',
        savedCount: result.savedCount
      }
    }
  }, [saveSchedule])

  // Define undoSchedule action
  useCopilotAction({
    name: 'undoSchedule',
    description: 'Discard the generated post schedule without saving. Use when user asks to "undo", "cancel", "discard schedule", "start over".',
    parameters: [],
    handler: async () => {
      const result = undoSchedule()
      return {
        success: result.success,
        message: result.success
          ? `Discarded ${result.discardedCount} preview posts. You can generate a new schedule anytime.`
          : 'No schedule to undo. The preview is already empty.',
        discardedCount: result.discardedCount
      }
    }
  }, [undoSchedule])

  return (
    <CopilotSidebar
      defaultOpen={false}
      clickOutsideToClose={true}
      labels={{
        title: 'Posts Assistant',
        initial: 'Hello! I can help you create a post schedule for next month.',
        placeholder: 'e.g., create post schedule for this month...'
      }}
      instructions={`You are a content planning assistant for social media posts.
        Current context:
        - Brand: ${brand.brandDescription}
        - Niche: ${brand.niche}
        - Content style: ${brand.contentStyle}
        - Language: ${brand.language}
        - Brand voice: ${brand.brandVoice.tone}
        - Products: ${products.filter(p => brand.selectedProductIds?.includes(p.id))
          .map(p => `- ${p.name}: ${p.detail || 'No description'}`).join('\n')}

        Available actions:
        1. generatePostSchedule - Generate 30-day post schedule with 20-30 content ideas
        2. saveSchedule - Save the generated schedule to database (only when preview posts exist)
        3. undoSchedule - Discard the generated schedule without saving

        

        Current state: ${hasPreview ? `${previewCount} preview posts ready to save or undo` : 'No preview posts'}`}

    >
      {children}
    </CopilotSidebar>
  )
}
