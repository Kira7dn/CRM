# AI Content Engine - Advanced Features TODO

## Vấn đề hiện tại
- ✅ **Đã có**: `GeneratePostMultiPassUseCase` (5 passes), `BrandMemory` (get/save), `VectorDBService` (Qdrant), `CacheService`
- ❌ **Thiếu**: Scoring pass, Research insights (Perplexity), RAG knowledge retrieval, tích hợp vào multi-pass

---

## TODO List

### Phase 1: Thêm Scoring Pass (Ưu tiên cao)
- [ ] **1.1** Thêm scoring logic vào cuối `generate-post-multi-pass.ts::execute()` (sau enhance pass)
- [ ] **1.2** Update `GeneratePostMultiPassResponse` interface: thêm `score`, `scoreBreakdown`, `weaknesses`, `suggestedFixes`
- [ ] **1.3** Update `PostForm.tsx`: Hiển thị score breakdown + weaknesses

### Phase 2: Research Use Case (Perplexity API)
- [ ] **2.1** Tạo adapter `infrastructure/adapters/perplexity-service.ts` (gọi Perplexity API)
- [ ] **2.2** Tạo use case `core/application/usecases/marketing/post/research-topic.ts`
- [ ] **2.3** Tạo depends `app/api/content-generation/depends.ts::createResearchTopicUseCase()`
- [ ] **2.4** Tích hợp vào `generate-post-multi-pass.ts`: gọi research trước idea pass, inject vào prompts

### Phase 3: RAG Knowledge Retrieval (Vector Search)
- [ ] **3.1** Tạo use case `core/application/usecases/marketing/post/retrieve-knowledge.ts`
- [ ] **3.2** Implement `generateEmbedding()` helper (OpenAI Embeddings API)
- [ ] **3.3** Tạo depends `app/api/content-generation/depends.ts::createRetrieveKnowledgeUseCase()`
- [ ] **3.4** Tích hợp vào `generate-post-multi-pass.ts`: inject RAG context vào draft/enhance passes

### Phase 4: UI Enhancements
- [ ] **4.1** `PostForm.tsx`: Hiển thị research insights, RAG sources, score breakdown
- [ ] **4.2** `PostForm.tsx`: Progress indicators cho từng pass (idea → angle → outline → draft → enhance → scoring)
- [ ] **4.3** `PostContentSettings.tsx`: Đã có brand memory settings, kiểm tra hoạt động đúng chưa

---

## Code Implementation

### Phase 1: Scoring Pass

**File: `core/application/usecases/marketing/post/generate-post-multi-pass.ts`**

```ts
// Thêm vào interface Response (dòng ~50)
export interface GeneratePostMultiPassResponse {
  sessionId: string
  title: string
  content: string
  metadata: {
    ideasGenerated: number
    anglesExplored: number
    passesCompleted: string[]
    improvements: string[]
    score?: number                          // NEW
    scoreBreakdown?: {                      // NEW
      clarity: number
      engagement: number
      brandVoice: number
      platformFit: number
      safety: number
    }
    weaknesses?: string[]                   // NEW
    suggestedFixes?: string[]               // NEW
  }
}

// Thêm vào cuối execute() - sau enhance pass (dòng ~148)
async execute(request: GeneratePostMultiPassRequest): Promise<GeneratePostMultiPassResponse> {
  // ... existing code (idea, angle, outline, draft, enhance passes)

  // Pass 6: Scoring (NEW) - Thêm sau dòng 145
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
    maxTokens: 500
  })

  // Clean response
  let cleanScoring = scoringResponse.content.trim()
  if (cleanScoring.startsWith('```')) {
    cleanScoring = cleanScoring.replace(/```(json)?\n?/g, '').trim()
  }

  const scoringResult = JSON.parse(cleanScoring)
  passesCompleted.push('scoring')

  // Update return
  return {
    sessionId,
    title: enhanced.title,
    content: enhanced.content,
    metadata: {
      ideasGenerated: finalSession.ideaPass?.ideas.length || 0,
      anglesExplored: finalSession.anglePass?.angles.length || 0,
      passesCompleted,
      improvements: enhanced.improvements,
      score: scoringResult.score,                      // NEW
      scoreBreakdown: scoringResult.scoreBreakdown,    // NEW
      weaknesses: scoringResult.weaknesses,            // NEW
      suggestedFixes: scoringResult.suggestedFixes     // NEW
    }
  }
}
```

---

### Phase 2: Research Topic Use Case

**File: `infrastructure/adapters/perplexity-service.ts`** (NEW)

```ts
/**
 * Perplexity AI Service for online research
 */
export class PerplexityService {
  private readonly apiKey: string
  private readonly baseURL = "https://api.perplexity.ai"

  constructor() {
    const key = process.env.PERPLEXITY_API_KEY
    if (!key) throw new Error("PERPLEXITY_API_KEY environment variable required")
    this.apiKey = key
  }

  async search(query: string): Promise<{
    content: string
    citations: Array<{ url: string; title: string }>
  }> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [{ role: "user", content: query }],
        return_citations: true
      })
    })

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0].message.content,
      citations: data.citations || []
    }
  }

  static isConfigured(): boolean {
    return !!process.env.PERPLEXITY_API_KEY
  }
}

let instance: PerplexityService | null = null

export function getPerplexityService(): PerplexityService {
  if (!instance) {
    if (!PerplexityService.isConfigured()) {
      throw new Error("Perplexity service not configured")
    }
    instance = new PerplexityService()
  }
  return instance
}
```

**File: `core/application/usecases/marketing/post/research-topic.ts`** (NEW)

```ts
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

export class ResearchTopicUseCase {
  async execute(request: ResearchTopicRequest): Promise<ResearchTopicResponse> {
    const perplexity = getPerplexityService()
    const llm = getLLMService()

    // Step 1: Research với Perplexity (online search)
    const researchQuery = `Research this topic for social media content creation:

Topic: ${request.topic}
Language: ${request.language || 'Vietnamese'}

Provide:
1. Key insights about this topic (current trends, audience interests)
2. Potential risks or controversies to avoid
3. Recommended content angles or approaches
4. Cite your sources`

    const researchResult = await perplexity.search(researchQuery)

    // Step 2: Parse kết quả thành structured format bằng LLM
    const parsePrompt = `Extract structured insights from this research:

${researchResult.content}

Return ONLY valid JSON:
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "risks": ["risk 1", "risk 2"],
  "recommendedAngles": ["angle 1", "angle 2", "angle 3"]
}`

    const parseResponse = await llm.generateCompletion({
      systemPrompt: "Extract structured data. Return valid JSON only. No markdown.",
      prompt: parsePrompt,
      temperature: 0.2,
      maxTokens: 600
    })

    let cleanContent = parseResponse.content.trim()
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```(json)?\n?/g, '').trim()
    }

    const parsed = JSON.parse(cleanContent)

    return {
      insights: parsed.insights || [],
      risks: parsed.risks || [],
      recommendedAngles: parsed.recommendedAngles || [],
      sources: researchResult.citations
    }
  }
}
```

**Update `app/api/content-generation/depends.ts`:**

```ts
import { ResearchTopicUseCase } from "@/core/application/usecases/marketing/post/research-topic"

export const createResearchTopicUseCase = async () => {
  return new ResearchTopicUseCase()
}
```

---

### Phase 3: RAG Knowledge Retrieval

**File: `core/application/usecases/marketing/post/retrieve-knowledge.ts`** (NEW)

```ts
import { getVectorDBService } from "@/infrastructure/adapters/vector-db"
import OpenAI from "openai"

export interface RetrieveKnowledgeRequest {
  topic: string
  limit?: number
}

export interface RetrieveKnowledgeResponse {
  context: string
  sources: Array<{
    postId: string
    title: string
    content: string
    similarity: number
  }>
}

export class RetrieveKnowledgeUseCase {
  private openai: OpenAI

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error("OPENAI_API_KEY required")
    this.openai = new OpenAI({ apiKey })
  }

  async execute(request: RetrieveKnowledgeRequest): Promise<RetrieveKnowledgeResponse> {
    const vectorDB = getVectorDBService()

    // Generate embedding for topic
    const embedding = await this.generateEmbedding(request.topic)

    // Search similar content in vector DB
    const results = await vectorDB.searchSimilar(embedding, {
      limit: request.limit || 5,
      scoreThreshold: 0.7
    })

    // Build context from results
    const context = results.length > 0
      ? results.map(r =>
          `[${r.metadata.title}]\n${r.content.slice(0, 200)}...`
        ).join('\n\n')
      : 'No relevant knowledge found.'

    return {
      context,
      sources: results.map(r => ({
        postId: r.postId,
        title: r.metadata.title || 'Untitled',
        content: r.content,
        similarity: r.score
      }))
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float"
    })
    return response.data[0].embedding
  }
}
```

**Update `app/api/content-generation/depends.ts`:**

```ts
import { RetrieveKnowledgeUseCase } from "@/core/application/usecases/marketing/post/retrieve-knowledge"

export const createRetrieveKnowledgeUseCase = async () => {
  return new RetrieveKnowledgeUseCase()
}
```

---

### Tích hợp Research + RAG vào Multi-pass

**Update `core/application/usecases/marketing/post/generate-post-multi-pass.ts`:**

```ts
import { ResearchTopicUseCase } from "./research-topic"
import { RetrieveKnowledgeUseCase } from "./retrieve-knowledge"
import { PerplexityService } from "@/infrastructure/adapters/perplexity-service"
import { VectorDBService } from "@/infrastructure/adapters/vector-db"

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

    // NEW: Research phase (optional - if Perplexity configured)
    let researchContext = ''
    if (request.topic && PerplexityService.isConfigured()) {
      try {
        const researchUseCase = new ResearchTopicUseCase()
        const research = await researchUseCase.execute({ topic: request.topic })
        researchContext = `
Research Insights: ${research.insights.join(', ')}
Recommended Angles: ${research.recommendedAngles.join(', ')}
Risks to Avoid: ${research.risks.join(', ')}`
      } catch (error) {
        console.warn('[Multi-Pass] Research failed:', error)
      }
    }

    // NEW: RAG phase (optional - if VectorDB configured)
    let ragContext = ''
    if (request.topic && VectorDBService.isConfigured()) {
      try {
        const ragUseCase = new RetrieveKnowledgeUseCase()
        const rag = await ragUseCase.execute({ topic: request.topic })
        ragContext = `
Knowledge Base Context:
${rag.context}`
      } catch (error) {
        console.warn('[Multi-Pass] RAG retrieval failed:', error)
      }
    }

    // Pass 1: Idea Generation - Inject research context
    if (!session.ideaPass) {
      const ideas = await this.ideaPass(llm, request, brandContext + researchContext)
      cache.updateSession(sessionId, {
        ideaPass: {
          ideas: ideas.ideas,
          selectedIdea: ideas.ideas[0],
        },
      })
      passesCompleted.push("idea")
    }

    // ... existing passes (angle, outline)

    // Pass 4: Draft Writing - Inject RAG context
    const session3 = cache.get<GenerationSession>(sessionId)!
    if (!session3.draftPass) {
      const draft = await this.draftPass(
        llm,
        request,
        brandContext + ragContext,  // Inject RAG knowledge
        session3.outlinePass!.outline
      )
      cache.updateSession(sessionId, {
        draftPass: {
          draft: draft.content,
          wordCount: draft.content.split(/\s+/).length,
        },
      })
      passesCompleted.push("draft")
    }

    // ... existing enhance pass + scoring pass

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
        suggestedFixes: scoringResult.suggestedFixes
      }
    }
  }
}
```

---

## Độ ưu tiên thực hiện

1. **Phase 1 (Scoring)** - Dễ nhất, không cần API mới
2. **Phase 3 (RAG)** - Đã có VectorDB, chỉ cần embedding API
3. **Phase 2 (Research)** - Cần Perplexity API key
4. **Phase 4 (UI)** - Sau khi có data từ backend

---

## Environment Variables cần thêm

```env
# Perplexity AI (Phase 2)
PERPLEXITY_API_KEY=your_key_here

# Qdrant Vector DB (Phase 3 - đã có)
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_key

# OpenAI (đã có - dùng cho embeddings)
OPENAI_API_KEY=your_openai_key
```
