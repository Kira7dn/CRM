/**
 * Research Topic Use Case
 * Uses Perplexity AI to research topics for content generation
 */

import { getPerplexityService } from "@/infrastructure/adapters/perplexity-service"
import { getLLMService } from "@/infrastructure/adapters/llm-service"

export interface ResearchTopicRequest {
  topic: string
  language?: string
}

export interface ResearchTopicResponse {
  insights: string[]
  risks: string[]
  recommendedAngles: string[]
  sources: Array<{ url: string; title: string }>
}

/**
 * Research Topic Use Case
 * Researches a topic using Perplexity online search and structures the results
 */
export class ResearchTopicUseCase {
  async execute(request: ResearchTopicRequest): Promise<ResearchTopicResponse> {
    const perplexity = getPerplexityService()
    const llm = getLLMService()

    // Step 1: Research with Perplexity (online search)
    const researchQuery = `Research this topic for social media content creation:

Topic: ${request.topic}
Language: ${request.language || 'Vietnamese'}

Provide:
1. Key insights about this topic (current trends, audience interests, relevant facts)
2. Potential risks or controversies to avoid when creating content
3. Recommended content angles or approaches that would resonate with the audience
4. Cite your sources

Focus on actionable insights for content creators.`

    const researchResult = await perplexity.search(researchQuery)

    // Step 2: Parse results into structured format using LLM
    const parsePrompt = `Extract structured insights from this research content:

${researchResult.content}

Return ONLY valid JSON (no markdown):
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "risks": ["risk 1", "risk 2"],
  "recommendedAngles": ["angle 1", "angle 2", "angle 3"]
}

Make insights specific and actionable for content creation.`

    const parseResponse = await llm.generateCompletion({
      systemPrompt: "You are a data extraction assistant. Return valid JSON only. Never use markdown code blocks.",
      prompt: parsePrompt,
      temperature: 0.2,
      maxTokens: 600
    })

    // Clean response
    let cleanContent = parseResponse.content.trim()
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```(json)?\n?/g, '').trim()
    }

    try {
      const parsed = JSON.parse(cleanContent)

      return {
        insights: parsed.insights || [],
        risks: parsed.risks || [],
        recommendedAngles: parsed.recommendedAngles || [],
        sources: researchResult.citations
      }
    } catch (error) {
      console.error('[Research] Failed to parse research results:', cleanContent)
      // Fallback: return empty structured data
      return {
        insights: [],
        risks: [],
        recommendedAngles: [],
        sources: researchResult.citations
      }
    }
  }
}
