'use client'

import { CopilotSidebar } from '@copilotkit/react-ui'
import { useCopilotAction, useCopilotReadable, useCopilotChatSuggestions, useFrontendTool } from '@copilotkit/react-core'
import { usePostStore } from '../_store/usePostStore'
import type { Post } from '@/core/domain/marketing/post'

interface PostsCopilotProps {
  children: React.ReactNode
}

export function PostsCopilot({ children }: PostsCopilotProps) {
  const {
    posts,
    createPost,
    setPreviewPosts,
    previewPosts,
    brand,
    products,
    generateSchedule,
    savePlannerPosts,
    undoSchedule,
  } = usePostStore()

  // Helper functions that were in the hook
  const generateScheduleWithProducts = async () => {
    const selectedProducts = products.filter((p: any) =>
      brand.selectedProductIds?.includes(p.id)
    )
    return generateSchedule(brand, selectedProducts)
  }

  const saveSchedule = async () => {
    return savePlannerPosts()
  }

  const hasPreview = previewPosts.length > 0
  const previewCount = previewPosts.length

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

  // Suggest next actions based on preview state
  // useCopilotChatSuggestions(
  //   {
  //     instructions: hasPreview
  //       ? `There are ${previewCount} preview posts waiting. Suggest: "Save schedule" to persist them to database, or "Undo schedule" to discard them.`
  //       : "No preview posts. Suggest: 'Generate post schedule' or 'Draft posts'",
  //     minSuggestions: hasPreview ? 2 : 1,
  //     maxSuggestions: hasPreview ? 2 : 3,
  //   },
  //   [hasPreview, previewCount]
  // )

  // Define generatePostSchedule action
  useCopilotAction({
    name: 'generatePostSchedule',
    description: 'Generate 30-day post schedule with 20-30 content ideas based on brand memory. Use when user asks to "create post schedule", "generate schedule", "plan content".',
    parameters: [],
    handler: async () => {
      const schedule = await generateScheduleWithProducts()
      return {
        success: true,
        message: `Created ${schedule.length} post ideas for the next 30 days. You can preview on calendar and click Save to save.`,
        count: schedule.length
      }
    }
  }, [generateScheduleWithProducts])

  // Define addDraftPost action
  useCopilotAction({
    name: 'addDraftPost',
    description: 'Draft a post to schedule. Use when user asks to "draft post", "create post", "add post". then return the post edit URL.',
    parameters: [
      {
        name: "idea",
        type: "string",
        description: "The main idea or concept of the post",
        required: true,
      },
      {
        name: "title",
        type: "string",
        description: "The title of the post",
        required: true,
      },
      {
        name: "body",
        type: "string",
        description: "The full content/text of the post",
        required: true,
      },
      {
        name: "hashtags",
        type: "string",
        description: "Comma-separated hashtags for the post",
        required: false,
      },
    ],
    handler: async (params: { idea: string; title: string; body: string; hashtags?: string }) => {
      const payload = {
        idea: params.idea,
        title: params.title,
        body: params.body,
        contentType: 'post' as const,
        hashtags: params.hashtags ? params.hashtags.split(',').map(tag => tag.trim()) : []
      }
      const result = await createPost(payload)
      const baseUrl = window.location.origin
      console.log(baseUrl);

      return {
        success: true,
        message: `Successfully drafted post: "${result.post.idea || result.post.title}". You can review and save it when ready.`,
        url: `${baseUrl}/crm/marketing/posts/edit?id=${result.post.id}`
      }
    }
  }, [createPost])

  // Define batchDraft action using modern useFrontendTool
  // Adds posts to previewPosts instead of creating them immediately
  useFrontendTool({
    name: 'batchDraft',
    description: `Create multiple draft posts at once and add them to preview (not saved to DB yet).
      CRITICAL REQUIREMENTS:
      - You MUST generate a scheduledDate (YYYY-MM-DD format) for EACH post
      - Spread posts across different dates (don't put all on same day)
      - Use dates within next 30 days from today: ${new Date().toISOString().split('T')[0]}

      Example call:
      {
        "posts": [
          {
            "idea": "Post idea 1",
            "title": "Title 1",
            "body": "Body content 1",
            "scheduledDate": "2025-12-25",
            "hashtags": "tag1,tag2"
          },
          {
            "idea": "Post idea 2",
            "title": "Title 2",
            "body": "Body content 2",
            "scheduledDate": "2025-12-27",
            "hashtags": "tag3,tag4"
          }
        ]
      }

User must call saveSchedule afterwards to save to database.`,
    parameters: [
      {
        name: "posts",
        type: "object[]",
        description: "Array of posts to create. EVERY post object MUST include: idea, title, body, and scheduledDate (YYYY-MM-DD). Optional: hashtags.",
        required: true,
        properties: [
          {
            name: "idea",
            type: "string",
            description: "The main idea or concept of the post",
            required: true,
          },
          {
            name: "title",
            type: "string",
            description: "The title of the post",
            required: true,
          },
          {
            name: "body",
            type: "string",
            description: "The full content/text of the post",
            required: true,
          },
          {
            name: "scheduledDate",
            type: "string",
            description: "REQUIRED: The scheduled date in YYYY-MM-DD format. Must be within next 30 days. Example: 2025-12-25",
            required: true,
          },
          {
            name: "hashtags",
            type: "string",
            description: "Comma-separated hashtags for the post",
            required: false,
          },
        ]
      },
    ],
    handler: async ({ posts }: { posts: Array<{ idea: string; title: string; body: string; scheduledDate?: string; hashtags?: string }> }) => {
      console.log("Generated posts:", posts);

      // Limit to a reasonable maximum to avoid abuse
      const postsToAdd = posts.slice(0, 50)

      // Auto-generate scheduledDate if missing (spread across next 30 days)
      const today = new Date()
      let dateOffset = 1 // Start from tomorrow

      const scheduleItems = postsToAdd.map((post, index) => {
        let scheduledDate = post.scheduledDate

        // If scheduledDate is missing or invalid, auto-generate
        if (!scheduledDate || scheduledDate.trim() === '') {
          const targetDate = new Date(today)
          targetDate.setDate(today.getDate() + dateOffset)
          scheduledDate = targetDate.toISOString().split('T')[0]

          // Spread posts across days (max 2 posts per day)
          if (index % 2 === 1) {
            dateOffset += 1
          }
        }

        // Convert scheduledDate (YYYY-MM-DD) to Date object for scheduledAt
        const [year, month, day] = scheduledDate.split('-').map(Number)
        const scheduledAt = new Date(year, month - 1, day, 10, 0, 0) // Default to 10:00 AM

        return {
          id: `temp-${crypto.randomUUID()}`, // Generate temporary ID for preview posts
          idea: post.idea,
          title: post.title,
          body: post.body,
          contentType: 'post' as const,
          platforms: [], // Empty platforms array for preview
          hashtags: post.hashtags ? post.hashtags.split(',').map(tag => tag.trim()) : [],
          mentions: [],
          media: undefined,
          userId: undefined,
          scheduledAt, // Use Date object instead of string
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as Post
      })

      // Merge with existing preview posts
      const existingPreviews = previewPosts || []
      setPreviewPosts([...existingPreviews, ...scheduleItems])

      // Group posts by date for schedule summary
      const scheduleByDate = scheduleItems.reduce((acc, item) => {
        const date = item.scheduledAt ? item.scheduledAt.toISOString().split('T')[0] : 'Unknown'
        if (!acc[date]) acc[date] = []
        if (item.title) {
          acc[date].push(item.title)
        }
        return acc
      }, {} as Record<string, string[]>)

      const totalPreview = existingPreviews.length + scheduleItems.length

      // Check if any dates were auto-generated
      const autoGeneratedCount = postsToAdd.filter(p => !p.scheduledDate || p.scheduledDate.trim() === '').length
      const autoGenNote = autoGeneratedCount > 0
        ? `\n⚠️ Note: Auto-generated posting dates for ${autoGeneratedCount} posts (spread across next ${Math.ceil(autoGeneratedCount / 2)} days).\n`
        : ''

      return {
        success: true,
        message: `✅ Successfully added ${scheduleItems.length} draft posts to preview (${totalPreview} total preview posts).${autoGenNote}
📅 Posts are now visible on the calendar but NOT saved to database yet.

What would you like to do next?
• Say "save schedule" to save all ${totalPreview} preview posts to database
• Say "undo schedule" to discard all preview posts and start over

Would you like me to save the schedule now?`,
        addedCount: scheduleItems.length,
        totalPreview,
        schedule: scheduleByDate,
        posts: scheduleItems.map(item => ({
          title: item.title,
          scheduledDate: item.scheduledAt ? item.scheduledAt.toISOString().split('T')[0] : undefined
        }))
      }
    },
    render: ({ args, status, result }: any) => {
      if (status === 'inProgress' || status === 'running' || status === 'pending') {
        return (
          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span>Adding {args?.posts?.length || 0} posts to preview…</span>
            </div>
          </div>
        )
      }

      if ((status === 'complete' || status === 'success') && result) {
        return (
          <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
            <h3 className="font-semibold mb-2">✅ Posts Added to Preview</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Added {result.addedCount} posts to preview ({result.totalPreview} total)
            </p>

            {/* Schedule Summary */}
            {result.schedule && Object.keys(result.schedule).length > 0 && (
              <div className="mb-3 p-3 bg-white dark:bg-gray-900 rounded border border-green-200 dark:border-green-800">
                <p className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">📅 Posting Schedule:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {Object.entries(result.schedule).sort().map(([date, titles]: [string, any]) => (
                    <div key={date} className="text-xs">
                      <span className="font-mono text-blue-600 dark:text-blue-400">{date}</span>
                      <span className="text-gray-500 mx-1">→</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {titles.length} post{titles.length > 1 ? 's' : ''}
                      </span>
                      <ul className="ml-4 mt-1 space-y-0.5">
                        {titles.map((title: string, idx: number) => (
                          <li key={idx} className="text-gray-600 dark:text-gray-400">
                            • {title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <p className="font-medium text-blue-600 dark:text-blue-400">Next steps:</p>
              <ul className="space-y-1 ml-4 list-disc text-gray-700 dark:text-gray-300">
                <li>Review posts on the calendar</li>
                <li>Use <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">"save schedule"</span> to save to database</li>
                <li>Or use <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">"undo schedule"</span> to discard</li>
              </ul>
            </div>
          </div>
        )
      }

      if (status === 'error') {
        return (
          <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
            <p className="text-red-600 dark:text-red-400">❌ Failed to add posts to preview</p>
          </div>
        )
      }

      return <></>
    }
  }, [previewPosts, setPreviewPosts])

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
          ? `Successfully saved ${result.savedCount} posts to database.The schedule is now active.`
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
          ? `Discarded ${result.discardedCount} preview posts.You can generate a new schedule anytime.`
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
          .map((p: any) => `- ${p.name}: ${p.detail || 'No description'}`).join('\n')
        }

        Available actions:
      1. generatePostSchedule - Generate 30-day post schedule with 20-30 AI content ideas (adds to preview)
      2. addDraftPost - Create a single draft post and save immediately to database
      3. batchDraft - Create multiple complete draft posts at once. CRITICAL: Each post MUST include scheduledDate in YYYY-MM-DD format. Required fields: idea, title, body, scheduledDate. Optional: hashtags. Posts are added to PREVIEW only, NOT saved to database yet. User MUST use "save schedule" to persist them.
      4. saveSchedule - Save ALL preview posts to database (works for both generatePostSchedule and batchDraft)
      5. undoSchedule - Discard ALL preview posts without saving

        CRITICAL requirements for batchDraft:
      - ALWAYS generate scheduledDate for each post (format: YYYY-MM-DD)
      - Spread posts across different dates (don't put all on the same day)
      - Use dates in the next 30 days from today (${new Date().toISOString().split('T')[0]})
      - Posts are added to preview (visible on calendar but not in database)
      - User can review preview posts on the calendar
      - User must explicitly call "save schedule" to persist to database
      - Or call "undo schedule" to discard all preview posts

        Current state: ${hasPreview ? `${previewCount} preview posts ready to save or undo. ASK USER if they want to "save schedule" or "undo schedule".` : 'No preview posts'} `}

    >
      {children}
    </CopilotSidebar>
  )
}
