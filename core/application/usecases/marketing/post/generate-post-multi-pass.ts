/**
 * Generate Post Multi-Pass Use Case
 * Orchestrates multi-pass content generation with episodic memory
 * Passes: Idea → Angle → Outline → Draft → Enhance
 */

import { getLLMService } from "@/infrastructure/adapters/llm-service"
import { getCacheService } from "@/infrastructure/adapters/cache-service"
import type { GenerationSession } from "@/infrastructure/adapters/cache-service"
import { PerplexityService } from "@/infrastructure/adapters/perplexity-service"
import { VectorDBService } from "@/infrastructure/adapters/vector-db"
import { ResearchTopicUseCase } from "./research-topic"
import { RetrieveKnowledgeUseCase } from "./retrieve-knowledge"
import { z } from "zod"

// Schema for each pass response
const IdeaPassSchema = z.object({
  ideas: z.array(z.string()).min(3),
})

const AnglePassSchema = z.object({
  angles: z.array(z.string()).min(3),
})

const OutlinePassSchema = z.object({
  outline: z.string(),
  sections: z.array(z.string()),
})

const DraftPassSchema = z.object({
  title: z.string(),
  content: z.string(),
})

const EnhancePassSchema = z.object({
  title: z.string(),
  content: z.string(),
  improvements: z.array(z.string()),
})

const ScoringPassSchema = z.object({
  score: z.number(),
  scoreBreakdown: z.object({
    clarity: z.number(),
    engagement: z.number(),
    brandVoice: z.number(),
    platformFit: z.number(),
    safety: z.number(),
  }),
  weaknesses: z.array(z.string()),
  suggestedFixes: z.array(z.string()),
})

export interface GeneratePostMultiPassRequest {
  topic?: string
  platform?: string
  brandMemory?: {
    productDescription: string
    contentStyle: string
    language: string
    brandVoice?: { tone: string; writingPatterns: string[] }
    keyPoints?: string[]
  }
  sessionId?: string
}

export interface GeneratePostMultiPassResponse {
  sessionId: string
  title: string
  content: string
  metadata: {
    ideasGenerated: number
    anglesExplored: number
    passesCompleted: string[]
    improvements: string[]
    score?: number
    scoreBreakdown?: {
      clarity: number
      engagement: number
      brandVoice: number
      platformFit: number
      safety: number
    }
    weaknesses?: string[]
    suggestedFixes?: string[]
  }
}

/**
 * Multi-pass content generation orchestrator
 */
export class GeneratePostMultiPassUseCase {
  async execute(request: GeneratePostMultiPassRequest): Promise<GeneratePostMultiPassResponse> {
    const llm = getLLMService()
    const cache = getCacheService()

    // Get or create session
    const sessionId = request.sessionId || `session_${Date.now()}`
    const session = cache.getOrCreateSession(sessionId, {
      topic: request.topic,
      platform: request.platform,
    })

    const brandContext = this.buildBrandContext(request.brandMemory)
    const passesCompleted: string[] = []

    // Research Phase (optional - if topic provided and Perplexity configured)
    let researchContext = ''
    if (request.topic && PerplexityService.isConfigured()) {
      try {
        console.log('[Multi-Pass] Starting research phase...')
        const researchUseCase = new ResearchTopicUseCase()
        const research = await researchUseCase.execute({
          topic: request.topic,
          language: request.brandMemory?.language || 'Vietnamese'
        })

        researchContext = `

Research Insights:
${research.insights.join('\n- ')}

Recommended Angles:
${research.recommendedAngles.join('\n- ')}

Risks to Avoid:
${research.risks.join('\n- ')}
`
        console.log('[Multi-Pass] Research completed:', research)
      } catch (error) {
        console.warn('[Multi-Pass] Research failed, continuing without research:', error)
      }
    }

    // RAG Phase (optional - if topic provided and VectorDB configured)
    let ragContext = ''
    if (request.topic && VectorDBService.isConfigured()) {
      try {
        console.log('[Multi-Pass] Starting RAG retrieval...')
        const ragUseCase = new RetrieveKnowledgeUseCase()
        const rag = await ragUseCase.execute({
          topic: request.topic,
          limit: 5
        })

        if (rag.sources.length > 0) {
          ragContext = `

Relevant Knowledge from Past Content:
${rag.context}
`
          console.log('[Multi-Pass] RAG retrieval completed:', rag.sources.length, 'sources found')
        }
      } catch (error) {
        console.warn('[Multi-Pass] RAG retrieval failed, continuing without RAG:', error)
      }
    }

    // Pass 1: Idea Generation (with research context)
    if (!session.ideaPass) {
      const ideas = await this.ideaPass(llm, request, brandContext + researchContext)
      cache.updateSession(sessionId, {
        ideaPass: {
          ideas: ideas.ideas,
          selectedIdea: ideas.ideas[0], // Auto-select first idea
        },
      })
      passesCompleted.push("idea")
    }

    // Pass 2: Angle Exploration
    const updatedSession = cache.get<GenerationSession>(sessionId)!
    if (!updatedSession.anglePass) {
      const angles = await this.anglePass(llm, request, brandContext, updatedSession.ideaPass!.selectedIdea)
      cache.updateSession(sessionId, {
        anglePass: {
          angles: angles.angles,
          selectedAngle: angles.angles[0], // Auto-select first angle
        },
      })
      passesCompleted.push("angle")
    }

    // Pass 3: Outline Creation
    const session2 = cache.get<GenerationSession>(sessionId)!
    if (!session2.outlinePass) {
      const outline = await this.outlinePass(
        llm,
        request,
        brandContext,
        session2.ideaPass!.selectedIdea,
        session2.anglePass!.selectedAngle
      )
      cache.updateSession(sessionId, {
        outlinePass: {
          outline: outline.outline,
          sections: outline.sections,
        },
      })
      passesCompleted.push("outline")
    }

    // Pass 4: Draft Writing (with RAG context)
    const session3 = cache.get<GenerationSession>(sessionId)!
    if (!session3.draftPass) {
      const draft = await this.draftPass(llm, request, brandContext + ragContext, session3.outlinePass!.outline)
      cache.updateSession(sessionId, {
        draftPass: {
          draft: draft.content,
          wordCount: draft.content.split(/\s+/).length,
        },
      })
      passesCompleted.push("draft")
    }

    // Pass 5: Enhancement (with RAG context)
    const session4 = cache.get<GenerationSession>(sessionId)!
    const enhanced = await this.enhancePass(llm, request, brandContext + ragContext, session4.draftPass!.draft)
    cache.updateSession(sessionId, {
      enhancePass: {
        enhanced: enhanced.content,
        improvements: enhanced.improvements,
      },
    })
    passesCompleted.push("enhance")

    // Pass 6: Scoring
    const scoringPrompt = `Score this content for quality:

Content: ${enhanced.content}
Brand context: ${brandContext}
Platform: ${request.platform || 'social media'}

Score each criterion (0-20):
1. Clarity: Is the message clear and easy to understand?
2. Engagement: Will it capture audience attention?
3. Brand Voice: Does it match the brand tone and style?
4. Platform Fit: Is it optimized for the target platform?
5. Safety: Does it avoid spam, fake claims, or inappropriate content?

Return ONLY valid JSON (no markdown):
{
  "score": number (sum of all, 0-100),
  "scoreBreakdown": {
    "clarity": number,
    "engagement": number,
    "brandVoice": number,
    "platformFit": number,
    "safety": number
  },
  "weaknesses": ["weakness 1", "weakness 2"],
  "suggestedFixes": ["suggested improvement 1", "suggested improvement 2"]
}`

    const scoringResponse = await llm.generateCompletion({
      systemPrompt: "You are a content quality analyst. Return valid JSON only. Never use markdown code blocks.",
      prompt: scoringPrompt,
      temperature: 0.1,
      maxTokens: 500,
    })

    // Clean response
    let cleanScoring = scoringResponse.content.trim()
    if (cleanScoring.startsWith('```')) {
      cleanScoring = cleanScoring.replace(/```(json)?\n?/g, '').trim()
    }

    try {
      const scoringResult = ScoringPassSchema.parse(JSON.parse(cleanScoring))
      console.log('[Multi-Pass] Scoring pass:', scoringResult)
      passesCompleted.push('scoring')

      // Final session
      const finalSession = cache.get<GenerationSession>(sessionId)!

      return {
        sessionId,
        title: enhanced.title,
        content: enhanced.content,
        metadata: {
          ideasGenerated: finalSession.ideaPass?.ideas.length || 0,
          anglesExplored: finalSession.anglePass?.angles.length || 0,
          passesCompleted,
          improvements: enhanced.improvements,
          score: scoringResult.score,
          scoreBreakdown: scoringResult.scoreBreakdown,
          weaknesses: scoringResult.weaknesses,
          suggestedFixes: scoringResult.suggestedFixes,
        },
      }
    } catch (error) {
      console.error('[Multi-Pass] Failed to parse scoring response:', cleanScoring)
      // Fallback: return without scoring
      const finalSession = cache.get<GenerationSession>(sessionId)!

      return {
        sessionId,
        title: enhanced.title,
        content: enhanced.content,
        metadata: {
          ideasGenerated: finalSession.ideaPass?.ideas.length || 0,
          anglesExplored: finalSession.anglePass?.angles.length || 0,
          passesCompleted,
          improvements: enhanced.improvements,
        },
      }
    }
  }

  private buildBrandContext(brandMemory?: GeneratePostMultiPassRequest['brandMemory']): string {
    if (!brandMemory) {
      return "Premium fresh seafood from Cô Tô Island, professional tone, Vietnamese language."
    }

    const parts = [
      `Product: ${brandMemory.productDescription}`,
      `Style: ${brandMemory.contentStyle}`,
      `Language: ${brandMemory.language}`,
    ]

    if (brandMemory.brandVoice) {
      parts.push(`Tone: ${brandMemory.brandVoice.tone}`)
      if (brandMemory.brandVoice.writingPatterns?.length > 0) {
        parts.push(`Writing patterns: ${brandMemory.brandVoice.writingPatterns.join(", ")}`)
      }
    }

    if (brandMemory.keyPoints?.length) {
      parts.push(`Key points: ${brandMemory.keyPoints.join(", ")}`)
    }

    return parts.join("\n")
  }

  private async ideaPass(
    llm: any,
    request: GeneratePostMultiPassRequest,
    brandContext: string
  ): Promise<{ ideas: string[] }> {
    const prompt = `Generate 3 unique content ideas for social media.

Brand Context:
${brandContext}

${request.topic ? `Topic: ${request.topic}` : ""}
${request.platform ? `Platform: ${request.platform}` : ""}

Requirements:
- Each idea must be unique and not repetitive
- Focus on value for the audience
- Make ideas specific and actionable

Return ONLY a valid JSON object with this exact format:
{
  "ideas": ["idea 1 as a single string", "idea 2 as a single string", "idea 3 as a single string"]
}

Do not include any markdown, code blocks, or additional text. Only return the raw JSON object.`

    const response = await llm.generateCompletion({
      systemPrompt: "You are a creative content strategist. Always respond with valid JSON only. Never use markdown code blocks.",
      prompt,
      temperature: 0.9,
      maxTokens: 500,
    })

    // Clean response content (remove markdown code blocks if present)
    let cleanContent = response.content.trim()
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```\n?/g, '').trim()
    }

    try {
      const parsed = JSON.parse(cleanContent)
      console.log('[Multi-Pass] Idea pass parsed:', parsed)
      return IdeaPassSchema.parse(parsed)
    } catch (error) {
      console.error('[Multi-Pass] Failed to parse idea response:', cleanContent)
      throw new Error(`Invalid JSON response from idea pass: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async anglePass(
    llm: any,
    request: GeneratePostMultiPassRequest,
    brandContext: string,
    selectedIdea: string
  ): Promise<{ angles: string[] }> {
    const prompt = `Generate 3 different angles for this content idea.

Brand Context:
${brandContext}

Idea: ${selectedIdea}

Requirements:
- Each angle must approach the idea differently
- Consider different audience perspectives
- Make angles compelling and unique

Return ONLY a valid JSON object with this exact format:
{
  "angles": ["angle 1 as a single string", "angle 2 as a single string", "angle 3 as a single string"]
}

Do not include any markdown, code blocks, or additional text. Only return the raw JSON object.`

    const response = await llm.generateCompletion({
      systemPrompt: "You are a content strategist. Always respond with valid JSON only. Never use markdown code blocks.",
      prompt,
      temperature: 0.8,
      maxTokens: 500,
    })

    // Clean response content
    let cleanContent = response.content.trim()
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```\n?/g, '').trim()
    }

    try {
      const parsed = JSON.parse(cleanContent)
      console.log('[Multi-Pass] Angle pass parsed:', parsed)
      return AnglePassSchema.parse(parsed)
    } catch (error) {
      console.error('[Multi-Pass] Failed to parse angle response:', cleanContent)
      throw new Error(`Invalid JSON response from angle pass: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async outlinePass(
    llm: any,
    request: GeneratePostMultiPassRequest,
    brandContext: string,
    idea: string,
    angle: string
  ): Promise<{ outline: string; sections: string[] }> {
    const prompt = `Create a content outline.

Brand Context:
${brandContext}

Idea: ${idea}
Angle: ${angle}

Requirements:
- Structure the content logically
- Include hook, body, and call-to-action
- Keep it concise for social media

Return ONLY a valid JSON object with this exact format:
{
  "outline": "Full outline text as a single string",
  "sections": ["section 1 as string", "section 2 as string", "section 3 as string"]
}

Do not include any markdown, code blocks, or additional text. Only return the raw JSON object.`

    const response = await llm.generateCompletion({
      systemPrompt: "You are a content strategist. Always respond with valid JSON only. Never use markdown code blocks.",
      prompt,
      temperature: 0.7,
      maxTokens: 600,
    })

    // Clean response content
    let cleanContent = response.content.trim()
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```\n?/g, '').trim()
    }

    try {
      const parsed = JSON.parse(cleanContent)
      console.log('[Multi-Pass] Outline pass parsed:', parsed)
      return OutlinePassSchema.parse(parsed)
    } catch (error) {
      console.error('[Multi-Pass] Failed to parse outline response:', cleanContent)
      throw new Error(`Invalid JSON response from outline pass: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async draftPass(
    llm: any,
    request: GeneratePostMultiPassRequest,
    brandContext: string,
    outline: string
  ): Promise<{ title: string; content: string }> {
    const prompt = `Write the full content based on this outline.

Brand Context:
${brandContext}

Outline:
${outline}

Requirements:
- Write engaging, natural content
- Match the brand voice and style
- Include a clear call-to-action
- Optimize for ${request.platform || "social media"}

Return ONLY a valid JSON object with this exact format:
{
  "title": "Post title as a single string (10-200 characters)",
  "content": "Full post content as a single string (50-3000 characters)"
}

Do not include any markdown, code blocks, or additional text. Only return the raw JSON object.`

    const response = await llm.generateCompletion({
      systemPrompt: "You are a professional content writer. Always respond with valid JSON only. Never use markdown code blocks.",
      prompt,
      temperature: 0.7,
      maxTokens: 1500,
    })

    // Clean response content
    let cleanContent = response.content.trim()
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```\n?/g, '').trim()
    }

    try {
      const parsed = JSON.parse(cleanContent)
      console.log('[Multi-Pass] Draft pass parsed:', { titleLength: parsed.title?.length, contentLength: parsed.content?.length })
      return DraftPassSchema.parse(parsed)
    } catch (error) {
      console.error('[Multi-Pass] Failed to parse draft response:', cleanContent)
      throw new Error(`Invalid JSON response from draft pass: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async enhancePass(
    llm: any,
    request: GeneratePostMultiPassRequest,
    brandContext: string,
    draft: string
  ): Promise<{ title: string; content: string; improvements: string[] }> {
    const prompt = `Enhance this draft content.

Brand Context:
${brandContext}

Draft:
${draft}

Requirements:
- Improve clarity and engagement
- Strengthen the call-to-action
- Fix any grammatical issues
- Maintain the core message
- List specific improvements made

Return ONLY a valid JSON object with this exact format:
{
  "title": "Enhanced title as a single string",
  "content": "Enhanced content as a single string",
  "improvements": ["improvement 1 as string", "improvement 2 as string", "improvement 3 as string"]
}

Do not include any markdown, code blocks, or additional text. Only return the raw JSON object.`

    const response = await llm.generateCompletion({
      systemPrompt: "You are an expert content editor. Always respond with valid JSON only. Never use markdown code blocks.",
      prompt,
      temperature: 0.6,
      maxTokens: 1500,
    })

    // Clean response content
    let cleanContent = response.content.trim()
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```\n?/g, '').trim()
    }

    try {
      const parsed = JSON.parse(cleanContent)
      console.log('[Multi-Pass] Enhance pass parsed:', {
        titleLength: parsed.title?.length,
        contentLength: parsed.content?.length,
        improvementsCount: parsed.improvements?.length
      })
      return EnhancePassSchema.parse(parsed)
    } catch (error) {
      console.error('[Multi-Pass] Failed to parse enhance response:', cleanContent)
      throw new Error(`Invalid JSON response from enhance pass: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}
