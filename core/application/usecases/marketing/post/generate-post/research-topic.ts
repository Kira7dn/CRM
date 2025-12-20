/**
 * Research Topic Use Case
 * Uses Perplexity AI for external knowledge + LLM for synthesis
 */

import { ILLMService } from "@/core/application/usecases/marketing/post/generate-post/post-gen-service.interfaces"
import { BrandMemory } from "@/core/domain/brand-memory";
import { Product } from "@/core/domain/catalog/product";

export interface PerplexityService {
  search(query: string): Promise<{
    content: string
    citations: Array<{ url: string; title: string }>
  }>
}

export interface ResearchTopicRequest {
  topic: string
  contentType?: string

  product?: Product

  brand?: BrandMemory
}

export interface ResearchTopicResponse {
  insights: string[]
  risks: string[]
  recommendedAngles: string[]
  sources: Array<{ url: string; title: string }>
}

export class ResearchTopicUseCase {
  constructor(
    private readonly llmService: ILLMService,
    private readonly perplexityService: PerplexityService,
  ) { }

  async execute(request: ResearchTopicRequest): Promise<ResearchTopicResponse> {

    const language = request.brand?.language || 'Vietnamese'

    /**
     * 1. Build research query (FOR SEARCH ENGINE)
     *    → factual, neutral, no creativity
     */
    const researchQueryParts = [
      `Research topic: ${request.topic}`,

      request.product
        ? `Product: ${request.product.name}`
        : null,

      request.brand?.niche
        ? `Industry / niche: ${request.brand.niche}`
        : null,

      request.brand?.brandDescription
        ? `Brand positioning: ${request.brand.brandDescription}`
        : null,

      request.brand?.brandVoice
        ? `Target audience tone: ${request.brand.brandVoice}`
        : null,

      `Focus on: market trends, consumer behavior, factual insights, risks, controversies`,

      `Language: ${language}`,
    ].filter(Boolean)


    const researchQuery = researchQueryParts.join('\n')

    const researchResult = await this.perplexityService.search(researchQuery)

    /**
     * 2. Synthesize research → structured insights
     *    → đây mới là chỗ dùng LLM
     */
    const synthesisPrompt = `
      You are a senior content strategist.

      Based ONLY on the research content below, extract actionable,
      evidence-based insights for ${request.contentType || 'social media'} content creation.

      Research content:
      ${researchResult.content}

      Context:
      - Topic: ${request.topic}
      - Product: ${request.product?.name || 'N/A'}
      - Brand positioning: ${request.brand?.brandDescription || 'N/A'}
      - Industry / niche: ${request.brand?.niche || 'N/A'}
      - Target audience tone: ${request.brand?.brandVoice || 'General audience'}

      Return ONLY valid JSON (no markdown, no explanation):

      {
        "insights": [
          "Concrete factual or behavioral insight grounded in the research"
        ],
        "risks": [
          "Potential controversy, misunderstanding, or legal/ethical risk"
        ],
        "recommendedAngles": [
          "Strategic content angle derived from the research (not copywriting)"
        ]
      }

      Rules:
      - Use ONLY information present in the research content
      - Do NOT invent statistics, claims, or facts
      - Keep each item concise (max 1 sentence)
      - Focus on strategy, not wording or hooks
    `


    const parseResponse = await this.llmService.generateCompletion({
      systemPrompt:
        "You are a research synthesis assistant. Return valid JSON only. Never use markdown or commentary.",
      prompt: synthesisPrompt,
      temperature: 0.2,
      maxTokens: 700
    })

    /**
     * 3. Parse & guard
     */
    let cleanContent = parseResponse.content.trim()
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```(json)?/g, '').trim()
    }

    try {
      const parsed = JSON.parse(cleanContent)

      return {
        insights: Array.isArray(parsed.insights) ? parsed.insights : [],
        risks: Array.isArray(parsed.risks) ? parsed.risks : [],
        recommendedAngles: Array.isArray(parsed.recommendedAngles) ? parsed.recommendedAngles : [],
        sources: researchResult.citations || []
      }
    } catch (error) {
      console.error('[ResearchTopicUseCase] JSON parse failed:', cleanContent)
      return {
        insights: [],
        risks: [],
        recommendedAngles: [],
        sources: researchResult.citations || []
      }
    }
  }
}
