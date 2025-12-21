// Use Node.js runtime for streaming batch operations
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Max 60 seconds for batch save

import { createPostUseCase } from '@/app/api/posts/depends'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import type { ContentType } from '@/core/domain/marketing/post'

interface BatchSaveItem {
  idea: string
  scheduledDate: string
}

interface BatchSaveRequest {
  items: BatchSaveItem[]
}

export async function POST(request: NextRequest) {
  try {
    const { items }: BatchSaveRequest = await request.json()

    // Auth check
    const cookieStore = await cookies()
    const userIdCookie = cookieStore.get("admin_user_id")
    if (!userIdCookie) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Please login first' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const userId = userIdCookie.value

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let savedCount = 0
        let failedCount = 0
        const errors: Array<{ idea: string; error: string }> = []

        try {
          const useCase = await createPostUseCase()

          // Send initial event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'start',
              total: items.length,
              savedCount: 0,
              progress: 0
            })}\n\n`)
          )

          // Process each item
          for (let i = 0; i < items.length; i++) {
            const item = items[i]

            try {
              // Parse scheduled date (YYYY-MM-DD format)
              const [year, month, day] = item.scheduledDate.split('-').map(Number)
              const scheduledAt = new Date(year, month - 1, day, 10, 0, 0) // Default to 10:00 AM

              // Create post
              const post = await useCase.execute({
                userId,
                title: item.idea,
                body: item.idea,
                contentType: 'post' as ContentType,
                scheduledAt,
              })

              savedCount++

              // Calculate progress
              const progress = Math.round(((i + 1) / items.length) * 100)

              // Send progress event
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'progress',
                  total: items.length,
                  savedCount,
                  failedCount,
                  progress,
                  currentIndex: i + 1,
                  postId: post.id.toString(),
                  idea: item.idea
                })}\n\n`)
              )
            } catch (error) {
              failedCount++
              const errorMessage = error instanceof Error ? error.message : 'Unknown error'

              console.error(`[BatchSave] Failed to save "${item.idea}":`, error)
              errors.push({
                idea: item.idea,
                error: errorMessage
              })

              // Send error event for this item
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'item-error',
                  idea: item.idea,
                  error: errorMessage,
                  savedCount,
                  failedCount
                })}\n\n`)
              )
            }
          }

          // Send completion event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'complete',
              total: items.length,
              savedCount,
              failedCount,
              errors,
              progress: 100
            })}\n\n`)
          )

          controller.close()
        } catch (error) {
          const errorEvent = {
            type: 'error',
            message: error instanceof Error ? error.message : String(error),
            savedCount,
            failedCount
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Content-Encoding': 'none',
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
