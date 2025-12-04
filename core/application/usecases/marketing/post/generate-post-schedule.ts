/**
 * Generate Post Schedule Use Case
 * AI generates monthly content calendar (20-30 post ideas)
 */

import { getLLMService } from "@/infrastructure/adapters/llm-service"
import type { BrandMemory } from "@/core/domain/brand-memory"
import type { Product } from "@/core/domain/catalog/product"

export interface PostScheduleItem {
  title: string
  idea: string
  scheduledDate: string  // ISO date string YYYY-MM-DD
  platform: string
}

export interface GeneratePostScheduleRequest {
  brandMemory: BrandMemory
  products: Product[]  // Selected products for context
  startDate: Date
  endDate: Date        // 1 month later
}

export interface GeneratePostScheduleResponse {
  schedule: PostScheduleItem[]
}

/**
 * GeneratePostScheduleUseCase
 * Generates 1-month content calendar based on brand context
 */
export class GeneratePostScheduleUseCase {
  async execute(request: GeneratePostScheduleRequest): Promise<GeneratePostScheduleResponse> {
    const llm = getLLMService()

    const productsContext = request.products.length > 0
      ? `Available Products:\n${request.products.map(p => `- ${p.name}: ${p.detail || 'No description'}`).join('\n')}`
      : ''

    const prompt = `Create a 1-month content calendar from ${request.startDate.toISOString().split('T')[0]} to ${request.endDate.toISOString().split('T')[0]}.

Brand: ${request.brandMemory.brandDescription}
Niche: ${request.brandMemory.niche}
Style: ${request.brandMemory.contentStyle}
Language: ${request.brandMemory.language}
Voice: ${request.brandMemory.brandVoice.tone}

${productsContext}

Instructions: ${request.brandMemory.contentsInstruction || 'Create engaging, diverse content ideas'}

Generate 20-30 post ideas with:
- Mix of content types (educational, promotional, storytelling, behind-the-scenes)
- Balanced frequency (1-2 posts per day maximum, spread throughout month)
- Variety in topics and angles
- Consider trending topics and seasonal relevance
- Include CTA suggestions from: ${request.brandMemory.ctaLibrary.join(', ')}

Return ONLY valid JSON (no markdown):
{
  "schedule": [
    {
      "title": "Concise post title",
      "idea": "Brief 1-2 sentence idea description",
      "scheduledDate": "YYYY-MM-DD",
      "platform": "facebook"
    }
  ]
}`

    const response = await llm.generateCompletion({
      systemPrompt: "You are a content strategist. Return valid JSON only, no markdown code blocks.",
      prompt,
      temperature: 0.8,
      maxTokens: 3000,
    })

    let cleanContent = response.content.trim()

    // Remove markdown code blocks if present
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```(json)?\n?/g, '').trim()
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.replace(/```$/g, '').trim()
    }

    try {
      const parsed = JSON.parse(cleanContent)
      return { schedule: parsed.schedule || [] }
    } catch (error) {
      console.error('[GenerateSchedule] Failed to parse response:', cleanContent)
      throw new Error(`Failed to parse schedule response: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
