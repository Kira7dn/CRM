'use client'

import { CopilotSidebar } from '@copilotkit/react-ui'
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core'
import { usePostStore } from '../_store/usePostStore'
import { usePostSettingStore } from '../_store/usePostSettingStore'
import { useGenerateSchedule } from '../_hooks/useGenerateSchedule'

interface PostsCopilotWrapperProps {
  children: React.ReactNode
}

export function PostsCopilotWrapper({ children }: PostsCopilotWrapperProps) {
  const { posts, previewPosts } = usePostStore()
  const { brand, products } = usePostSettingStore()
  const { generateSchedule } = useGenerateSchedule()

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
      previewCount: previewPosts.length,
      hasPreview: previewPosts.length > 0
    }
  })

  // Define generatePostSchedule action
  useCopilotAction({
    name: 'generatePostSchedule',
    description: 'Generate 30-day post schedule with 20-30 content ideas based on brand memory. Use when user asks to "tạo lịch đăng bài", "generate schedule", "lên kế hoạch content".',
    parameters: [],
    handler: async () => {
      const schedule = await generateSchedule()
      return {
        success: true,
        message: `Đã tạo ${schedule.length} ý tưởng bài viết cho 30 ngày tới. Bạn có thể xem preview trên calendar và click Save để lưu.`,
        count: schedule.length
      }
    }
  })

  return (
    <CopilotSidebar
      defaultOpen={false}
      clickOutsideToClose={true}
      labels={{
        title: 'Posts Assistant',
        initial: 'Xin chào! Tôi có thể giúp bạn tạo lịch đăng bài cho tháng tới.',
        placeholder: 'Ví dụ: tạo lịch đăng bài cho tháng này...'
      }}
      instructions={`You are a content planning assistant for social media posts.
        Current context:
        - Brand: ${brand.brandDescription}
        - Niche: ${brand.niche}
        - Content style: ${brand.contentStyle}
        - Language: ${brand.language}
        - Brand voice: ${brand.brandVoice.tone}

        You can help users:
        - Generate post schedule for the next 30 days using generatePostSchedule action
        - View preview posts on the calendar (amber colored events with sparkles icon)
        - Save or undo generated posts

        When user asks to generate schedule, use the generatePostSchedule action.
        Always respond in Vietnamese unless user prefers English.`}
    >
      {children}
    </CopilotSidebar>
  )
}
