'use client'

import { useMemo } from 'react'
import { CopilotKitCSSProperties, CopilotPopup } from '@copilotkit/react-ui'
import { useCopilotAction, useCopilotChatSuggestions, useCopilotReadable, useFrontendTool } from '@copilotkit/react-core'
import { usePostStore } from '../_store/usePostStore'
import type { Post } from '@/core/domain/marketing/post'
import { parseHashtags } from './post-form/views/utils'
import { calendarDateWithLocalTime } from '@/lib/date-utils'

export function PostsCopilot() {
  const {
    posts,
    createPost,
    setPreviewPosts,
    previewPosts,
    brand,
    products,
    saveSchedule,
    undoSchedule,
  } = usePostStore()


  const hasPreview = previewPosts.length > 0
  const previewCount = previewPosts.length

  // Dynamic suggestions based on context - passed directly to CopilotPopup
  const suggestions = useMemo(() => {
    const result: Array<{ message: string; title: string }> = []

    if (hasPreview) {
      // User has preview posts - suggest saving or discarding
      result.push({
        title: `💾 Save ${previewCount} posts`,
        message: `Save all ${previewCount} preview posts to calendar`
      })
      result.push({
        title: '🔄 Undo posts',
        message: `Discard all ${previewCount} preview posts`
      })
    } else {
      // No preview - suggest content creation based on current state
      const now = new Date()
      const currentDay = now.getDate()
      const currentMonth = now.getMonth() + 1 // 1-12
      const currentYear = now.getFullYear()
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
      const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const nextMonthName = monthNames[nextMonth - 1]
      const isEndOfMonth = currentDay > 20

      if (posts.length === 0) {
        // No posts at all - onboarding suggestions
        result.push({
          title: `🚀 Plan ${nextMonthName}`,
          message: `Create a complete 30-day content plan for ${nextMonthName} ${nextMonthYear}`
        })
        result.push({
          title: '✨ Quick start',
          message: 'Generate 10 post ideas to get started'
        })
      } else if (isEndOfMonth) {
        // End of month - focus on next month planning
        result.push({
          title: `📅 Next month plan`,
          message: `Plan complete ${nextMonthName} content calendar with 30 posts`
        })
        result.push({
          title: `💡 Early Post for ${nextMonthName}`,
          message: `Add 5 posts for the first week of ${nextMonthName}`
        })
      } else {
        // Mid-month - focus on filling current gaps
        result.push({
          title: '📊 Fill the gaps',
          message: 'Add 15 more posts to complete this month'
        })
        result.push({
          title: `🔮 Preview ${nextMonthName}`,
          message: `Start planning content for ${nextMonthName}`
        })
      }

      // Context-aware single post suggestion
      result.push({
        title: '⚡ Post for today',
        message: 'Create 1 engaging post for today'
      })
    }

    // Always show help option
    result.push({
      title: '💭 Strategy tips',
      message: 'Get content strategy tips for my brand'
    })

    return result
  }, [hasPreview, previewCount, posts.length])

  // useCopilotChatSuggestions(
  //   {
  //     instructions: "Suggest the most relevant next actions.",
  //   },
  //   [suggestions],
  // );

  // Make brand context readable to AI
  useCopilotReadable({
    description: 'Brand memory and content strategy - Complete brand identity, voice guidelines, and product catalog for content generation',
    value: {
      brandIdentity: {
        description: brand.brandDescription,
        niche: brand.niche,
        contentStyle: brand.contentStyle,
        language: brand.language,
      },
      brandVoice: {
        tone: brand.brandVoice.tone,
        writingPatterns: brand.brandVoice.writingPatterns,
      },
      brandAssets: {
        keyPoints: brand.keyPoints,
        ctaLibrary: brand.ctaLibrary,
        contentsInstruction: brand.contentsInstruction,
      },
      selectedProducts: products
        .filter(p => brand.selectedProductIds?.includes(p.id))
        .map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice,
          detail: p.detail,
          sizes: p.sizes,
          colors: p.colors,
        })),
      productSummary: {
        totalProducts: products.length,
        selectedCount: brand.selectedProductIds?.length || 0,
      }
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

  // Define addDraftPost action
  useCopilotAction({
    name: 'addDraftPost',
    description: 'Create a single high-quality marketing post with strategic content and save immediately to database. Use brand voice, integrate products naturally, and generate scheduledAt automatically.',
    parameters: [
      {
        name: "post",
        type: "object",
        description: "Complete post object with all required properties",
        required: true,
        properties: [
          {
            name: "idea",
            type: "string",
            description: "The main idea or concept of the post",
            required: false,
          },
          {
            name: "title",
            type: "string",
            description: "The title of the post",
            required: false,
          },
          {
            name: "body",
            type: "string",
            description: "The full content/text of the post",
            required: false,
          },
          {
            name: "hashtags",
            type: "string[]",
            description: "Array of hashtags for the post",
            required: false,
          },
          {
            name: "scheduledAt",
            type: "string",
            description: "Scheduled date",
            required: false,
          },
          {
            name: "mentions",
            type: "string[]",
            description: "Array of mentions",
            required: false,
          }
        ]
      },
    ],
    handler: async (args: { post: any }) => {
      const post = args.post as Post;
      const payload = {
        idea: post.idea,
        title: post.title,
        body: post.body,
        scheduledAt: post.scheduledAt,
        contentType: "post" as const,
        hashtags: parseHashtags(post.hashtags),
        mentions: post.mentions
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
    description: 'Use this to create more than  1 Post. Each post must include scheduledAt (YYYY-MM-DD). Posts added to preview (not saved to DB).',
    parameters: [
      {
        name: "posts",
        type: "object[]",
        description: "Array of posts to create. EVERY post object MUST include: idea, scheduledAt (YYYY-MM-DD). Optional: hashtags.",
        required: true,
        properties: [
          {
            name: "idea",
            type: "string",
            description: "The main idea or concept of the post",
            required: true,
          },
          {
            name: "scheduledAt",
            type: "string",
            description: "REQUIRED: The scheduled date in YYYY-MM-DD format. Must be within next 30 days. Example: 2025-12-25",
            required: true,
          },
          {
            name: "hashtags",
            type: "string",
            description: "Comma-separated hashtags for the post (e.g., '#seafood,#fresh,#cotoisland')",
            required: false,
          },
        ]
      },
    ],
    handler: async (args: { posts: any[] }) => {
      console.log("Generated posts (raw from AI):", args.posts);

      // Parse dates and hashtags, filter out invalid keys
      const parsedPosts = args.posts.map((post: any) => {
        // Convert scheduledAt YYYY-MM-DD to UTC ISO string with default 8:00 PM local time
        let scheduledAt: string | undefined;
        if (post.scheduledAt && typeof post.scheduledAt === 'string') {
          const [year, month, day] = post.scheduledAt.split('-').map(Number);
          // Default publish time: 8:00 PM local time (20:00)
          scheduledAt = calendarDateWithLocalTime(year, month, day, 20, 0);
        }

        // Parse hashtags to ensure consistent format
        const hashtags = parseHashtags(post.hashtags);

        // Only keep valid Post fields (filter out extra keys from AI)
        // This prevents AI from adding random fields like "content", "description", etc.
        const validPost = {
          idea: post.idea,
          title: post.title,
          body: post.body,
          scheduledAt, // ISO string, not Date object
          hashtags,
          mentions: post.mentions,
        };

        return validPost;
      });

      console.log("Generated posts (cleaned):", parsedPosts);
      const posts = parsedPosts as Post[];


      // Merge with existing preview posts
      const existingPreviews = previewPosts || []
      setPreviewPosts([...existingPreviews, ...posts])

      return {
        success: true,
        addedCount: posts.length,
        posts,
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
    <div
      style={
        {
          "--copilot-kit-primary-color": "#000000",
        } as CopilotKitCSSProperties
      }
    >
      <CopilotPopup
        defaultOpen={false}
        clickOutsideToClose={true}
        suggestions={suggestions}
        labels={{
          title: 'Posts Assistant',
          initial: 'Hello! I can help you create a post schedule for next month.',
          placeholder: 'e.g., create post schedule for this month...'
        }}
        instructions={`
          You are a social media content planner.

          GOAL:
          Help the user create clear and practical post plans (daily or monthly).

          CONTEXT:
          You already have access to brand info, products, and guidelines from useCopilotReadable.

          WHAT TO CREATE:
          Each post must include:
          - idea: short, clear post idea
          - scheduledAt: YYYY-MM-DD
          - optional hashtags (5–10)

          CONTENT RULES (simple):
          - Focus on value first, promotion second
          - Mix content types:
            - Educational
            - Brand / behind-the-scenes
            - Product-related (light, not pushy)
            - Engagement (questions, prompts)

          AVAILABLE ACTIONS:

          1. addDraftPost
          - Create ONE post
          - Save directly to database
          - Use when user asks for a single post or specific date

          2. batchDraft
          - Create a post plan for a period (usually 7–30 days)
          - 1 post per day is enough
          - MUST include scheduledAt for every post
          - Posts go to PREVIEW only

          3. saveSchedule
          - Save all preview posts to database

          4. undoSchedule
          - Clear preview posts and start over

          IMPORTANT:
          - Do NOT over-explain
          - Do NOT write full captions unless asked
          - Focus on planning, not copywriting
          - Today is ${new Date().toISOString().split('T')[0]}
          `}
      />
    </div>
  )
}
