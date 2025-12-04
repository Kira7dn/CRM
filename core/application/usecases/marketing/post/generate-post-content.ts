import { getLLMService } from "@/infrastructure/adapters/llm-service"
import { z } from "zod"

const ResponseSchema = z.object({
  title: z.string(),
  content: z.string(),
  variations: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
      style: z.string(),
    })
  ),
})

export interface GeneratePostContentRequest {
  topic?: string
  platform?: string
  idea?: string // NEW: Post idea from schedule
  productUrl?: string // NEW: Product URL for context
  detailInstruction?: string // NEW: Specific instructions for this post
}

export interface GeneratePostContentResponse {
  title: string
  content: string
  variations: Array<{
    title: string
    content: string
    style: string
  }>
}

export class GeneratePostContentUseCase {
  async execute(params: GeneratePostContentRequest): Promise<GeneratePostContentResponse> {
    // Load settings (business logic)
    const settings = this.loadSettings()

    // Build prompt (business logic) - UPDATED with new fields
    const prompt = `Generate social media post content:

Product: ${settings.productDescription}
Style: ${settings.contentStyle}
Language: ${settings.language}
${params.topic ? `Topic: ${params.topic}` : ""}
${params.platform ? `Platform: ${params.platform}` : ""}
${params.idea ? `Post Idea: ${params.idea}` : ""}
${params.productUrl ? `Product URL for reference: ${params.productUrl}` : ""}
${params.detailInstruction ? `Specific Instructions: ${params.detailInstruction}` : ""}

Generate:
1. One main post title (10-200 characters)
2. One main post content (50-3000 characters)
3. Three variations with different styles (professional, casual, promotional)

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "title": "string",
  "content": "string",
  "variations": [
    { "title": "string", "content": "string", "style": "professional" },
    { "title": "string", "content": "string", "style": "casual" },
    { "title": "string", "content": "string", "style": "promotional" }
  ]
}`

    // Call generic AI adapter
    const llm = getLLMService()
    const response = await llm.generateCompletion({
      systemPrompt: "You are a professional social media content creator. Always respond with valid JSON only.",
      prompt: prompt,
      temperature: 0.8,
      maxTokens: 1000,
    })

    // Parse and validate
    const parsed = ResponseSchema.parse(JSON.parse(response.content))

    return parsed
  }

  private loadSettings() {
    // Server-side: Cannot access localStorage, return defaults
    // Client will pass settings via context if needed
    return {
      productDescription: "Premium fresh seafood from Cô Tô Island, delivered daily",
      contentStyle: "professional",
      language: "vietnamese",
    }
  }
}
