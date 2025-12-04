# AI Content Generation - Implementation Plan

## Mục tiêu
Thêm nút "Generate with AI" vào PostForm để tạo title và content cho social media posts.

---

## Architecture (Clean/Onion)

### 1. Use Case (Business Logic)
**File**: `core/application/usecases/marketing/post/generate-post-content.ts`

```typescript
import { getLLMService } from "@/infrastructure/adapters/external/llm"
import { z } from "zod"

const ResponseSchema = z.object({
  title: z.string(),
  content: z.string(),
  variations: z.array(z.object({
    title: z.string(),
    content: z.string(),
    style: z.string()
  }))
})

export class GeneratePostContentUseCase {
  async execute(params: { topic?: string; platform?: string }) {
    // ✅ Load settings (business logic)
    const settings = this.loadSettings()

    // ✅ Build prompt (business logic)
    const prompt = `Generate social media post:
Product: ${settings.productDescription}
Style: ${settings.contentStyle}
Language: ${settings.language}
${params.topic ? `Topic: ${params.topic}` : ''}
${params.platform ? `Platform: ${params.platform}` : ''}

Return JSON with: title, content, variations (3 different styles)`

    // ✅ Call generic AI adapter
    const llm = getLLMService()
    const response = await llm.generateCompletion({
      systemMessage: "You are a social media content creator.",
      userMessage: prompt,
      temperature: 0.8,
      maxTokens: 1000
    })

    // ✅ Parse and validate
    return ResponseSchema.parse(JSON.parse(response.content))
  }

  private loadSettings() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('post_content_settings')
      if (stored) return JSON.parse(stored)
    }
    return {
      productDescription: 'Premium fresh seafood from Cô Tô Island',
      contentStyle: 'professional',
      language: 'vietnamese'
    }
  }
}
```

### 2. Dependencies Factory
**File**: `app/api/content-generation/depends.ts`

```typescript
import { GeneratePostContentUseCase } from "@/core/application/usecases/marketing/post/generate-post-content"

export const createGeneratePostContentUseCase = async () => {
  return new GeneratePostContentUseCase()
}
```

### 3. Server Action
**File**: `app/(features)/crm/campaigns/posts/actions.ts` (add)

```typescript
"use server"
import { createGeneratePostContentUseCase } from "@/app/api/content-generation/depends"

export async function generatePostContentAction(params: { topic?: string; platform?: string }) {
  try {
    const useCase = await createGeneratePostContentUseCase()
    const result = await useCase.execute(params)
    return { success: true, content: result }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
```

### 4. UI Integration
**File**: `app/(features)/crm/campaigns/posts/_components/PostForm.tsx` (update)

```typescript
import { Sparkles, Loader2 } from "lucide-react"
import { generatePostContentAction } from "../actions"

// Add state
const [isGenerating, setIsGenerating] = useState(false)
const [variations, setVariations] = useState([])

// Add handler
const handleGenerateAI = async () => {
  setIsGenerating(true)
  const result = await generatePostContentAction({
    topic: title || undefined,
    platform: selectedPlatforms[0]
  })
  if (result.success) {
    setTitle(result.content.title)
    setContent(result.content.content)
    setVariations(result.content.variations)
  }
  setIsGenerating(false)
}

// Add button before title field
<Button type="button" variant="outline" onClick={handleGenerateAI} disabled={isGenerating}>
  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
  Generate with AI
</Button>

// Add variations selector after content field (if variations exist)
```

---

## Implementation Steps (2 hours)

1. **Use Case** (45 min): Create use case với prompt building và settings loading
2. **Server Action** (15 min): Create depends.ts và action
3. **UI** (45 min): Add button, loading state, variations selector
4. **Test** (15 min): Test generation flow

---


Dựa trên **mục tiêu dự án** của bạn:

* tạo ra **AI Agent viết content chất lượng cao, không trùng lặp**
* có khả năng **hiểu brand**, **ghi nhớ chiến lược dài hạn**,
* có **multi-pass generation**, **RAG**, **content scoring**,
* dùng trong CRM với tài liệu sản phẩm/thương hiệu lâu dài
* có **CopilotKit** + backend Node/TS

→ **Tôi đề xuất một cấu trúc Memory System tối ưu nhất cho dự án**, cực thực tế, dễ triển khai, đảm bảo chất lượng cao nhất.

---

# 🎯 **KẾT LUẬN NGẮN GỌN**

### **Bạn nên dùng cấu trúc 3 tầng, nhưng tùy chỉnh để phục vụ Content AI**

| Layer                                           | Mục đích                                                        | Công nghệ                     |
| ----------------------------------------------- | --------------------------------------------------------------- | ----------------------------- |
| **Structured Memory (Brand & Strategy Memory)** | Ghi nhớ brand voice, sản phẩm, CTA, mục tiêu content, audience  | MongoDB / JSON                |
| **Semantic Memory (Vector Memory)**             | Chống trùng lặp nội dung, hiểu lịch sử nội dung, tìm insight cũ | Qdrant / Pinecone             |
| **Episodic Summary (Short-term Memory)**        | Ghi nhớ ngắn hạn cho session content pipeline                   | Summarize bằng LLM, lưu cache |

➡ **Đây là cấu trúc hiện đại nhất, phù hợp nhất với usecase của bạn.**
Không thừa, không thiếu.

Tôi đi sâu hơn từng phần:

---

# 🧱 **1) Structured Memory (Brand, Strategy, Rules) — BẮT BUỘC CÓ**

### Lưu:

* mô tả brand
* tone & voice
* product descriptions
* unique selling points
* CTA
* audience segmented
* style rules
* keywords ưu tiên
* các topic chiến lược

Ví dụ:

```json
{
  "brandVoice": {
    "tone": "warm, expert, trustworthy",
    "writingPatterns": [
      "kể chuyện người thật",
      "ưu tiên insight chính xác",
      "tránh hype"
    ]
  },
  "product": {
    "description": "Hải sản tươi Cao Cấp từ Cô Tô",
    "keyPoints": [
      "đánh bắt trong ngày",
      "vận chuyển 0-4 độ",
      "hoàn toàn không ướp đá"
    ]
  },
  "ctaLibrary": [
    "nhắn Tin nhận giá tươi hôm nay",
    "đặt hàng nhanh 60s"
  ]
}
```

### Vai trò:

✔ Giúp AI luôn consistent
✔ Tránh nội dung lệch tông
✔ Không cần lưu embedding (nhanh hơn)
✔ Cực kỳ phù hợp cho CRM + CopilotKit

### Công nghệ:

* MongoDB
* Hoặc JSON file nếu muốn đơn giản

---

# 🧠 **2) Semantic Memory (Vector Memory) — QUAN TRỌNG NHẤT**

### Đây là module giúp AI *không trùng lặp* và *viết nội dung sâu sắc*.

Bạn lưu embedding của:

* tất cả nội dung AI đã viết
* insight đã dùng
* story đã dùng
* angle đã dùng
* performance score
* tài liệu sản phẩm (RAG)
* bài viết thật từ thị trường (nếu crawl data)

### Dạng lưu:

Vector DB (Qdrant hoặc Pinecone)

### Khi generate content:

1. Bạn tạo một **draft idea** → embedding
2. Query vector memory → tìm nội dung giống nhất
3. Nếu bài quá giống:
   → đổi angle, insight, CTA
4. Inject nội dung liên quan để tăng chất lượng
   → RAG cho các fact
   → story cũ
   → insight cũ

### Tính năng phải có:

✔ chống trùng lặp
✔ tăng chiều sâu nội dung
✔ viết theo chiến lược dài hạn
✔ biết “tôi đã từng viết gì”

### Công nghệ đề xuất:

* Qdrant (mạnh, open-source, dễ deploy)
* hoặc Pinecone nếu muốn cloud

---

# 🧠 **3) Episodic Memory (Short-term State) — DÙNG CHO MULTI-PASS**

AI của bạn có **multi-pass generation**:

* Idea Pass
* Angle Pass
* Outline Pass
* Draft Pass
* Enhance Pass
* Evaluate Pass

→ Trong mỗi pass, AI cần nhớ "context trước đó của chính nó".

Nhưng bạn không cần lưu lâu dài.

### Cấu trúc:

```
/memory/runtime/
    idea_pass.json
    angle_pass.json
    outline_pass.json
    draft.json
```

### Tại cuối pipeline:

* summarize lại bài → đưa vào semantic memory
* clear episodic memory → tránh rác

---

# 🔥 **TÓM GỌN LẠI CHO DỰ ÁN CỦA BẠN**

## Bạn nên dùng cấu trúc 3 lớp dưới đây:

---

## **1️⃣ Structured Memory (MongoDB)**

**Lưu brand voice + product + CTA + rule + strategy**
→ Dùng mỗi lần generate.

---

## **2️⃣ Long-term Semantic Memory (VectorDB)**

**Lưu toàn bộ content đã tạo + insight + story + fact**
→ Dùng chống trùng lặp và tăng chất lượng.

---

## **3️⃣ Short-term Episodic Memory (Cache / Redis / JSON)**

**Lưu từng pass trong multi-pass pipeline**
→ Clear sau generate.

---

# 📌 **Memory System Implementation**

## TODO: Layer 1 - Structured Memory (Brand & Strategy)

**Status**: ✅ **UI sẵn có** (PostContentSettings.tsx), chỉ cần migrate localStorage → MongoDB

### Đã có:
- ✅ UI Component: `PostContentSettings.tsx`
- ✅ Interface: `ContentSettings` (productDescription, niche, contentStyle, language)
- ✅ localStorage integration: `getContentSettings()`, `saveContentSettings()`

### Cần bổ sung:
- [ ] Migrate to MongoDB:
  - Create domain entity: `core/domain/brand-memory.ts` (extends ContentSettings)
  - Add fields: `brandVoice`, `ctaLibrary`, `writingPatterns`, `keyPoints`
  - Create repository: `infrastructure/repositories/brand-memory-repo.ts`
  - Create use case: `core/application/usecases/marketing/brand-memory/get-brand-memory.ts`
  - Create use case: `core/application/usecases/marketing/brand-memory/save-brand-memory.ts`
  - Create depends.ts: `app/api/brand-memory/depends.ts`
  - Create server actions in `posts/actions.ts`: `getBrandMemoryAction`, `saveBrandMemoryAction`

- [ ] Update `PostContentSettings.tsx`:
  - Replace localStorage calls with server actions
  - Add new fields: `brandVoice` (tone, patterns), `ctaLibrary` (array of CTAs), `keyPoints` (array)
  - Keep fallback to localStorage for offline use

- [ ] Update `GeneratePostContentUseCase`:
  - Load brand memory from MongoDB instead of localStorage
  - Inject into prompt generation

**Estimate**: 2 hours (giảm từ 3h vì UI đã có)

---

## TODO: Layer 2 - Semantic Memory (Vector DB)

**Tech**: Qdrant Cloud (free tier: 1GB)

### Tasks:
- [ ] Setup Qdrant client: `infrastructure/adapters/vector-db.ts`
  ```typescript
  interface ContentEmbedding {
    id: string
    postId: string
    content: string
    embedding: number[]
    metadata: { platform: string; topic: string; score?: number }
    createdAt: Date
  }
  ```

- [ ] Create embedding service: `infrastructure/adapters/embedding-service.ts` (OpenAI text-embedding-3-small)
- [ ] Create use case: `core/application/usecases/marketing/content-memory/store-content-embedding.ts`
- [ ] Create use case: `core/application/usecases/marketing/content-memory/check-content-similarity.ts`
- [ ] Update `GeneratePostContentUseCase` to:
  - Check similarity before generation
  - Store embedding after successful post creation
- [ ] Add env vars: `QDRANT_URL`, `QDRANT_API_KEY`, `OPENAI_API_KEY`

**Estimate**: 5 hours

---

## TODO: Layer 3 - Episodic Memory (Multi-pass Cache)

**Tech**: Redis or in-memory cache

### Tasks:
- [ ] Create cache service: `infrastructure/adapters/cache-service.ts`
  ```typescript
  interface GenerationSession {
    sessionId: string
    ideaPass?: { ideas: string[]; selectedIdea: string }
    anglePass?: { angles: string[]; selectedAngle: string }
    outlinePass?: { outline: string }
    draftPass?: { draft: string }
    expiresAt: Date
  }
  ```

- [ ] Create multi-pass use cases:
  - `core/application/usecases/marketing/post/generate-idea-pass.ts`
  - `core/application/usecases/marketing/post/generate-angle-pass.ts`
  - `core/application/usecases/marketing/post/generate-outline-pass.ts`
  - `core/application/usecases/marketing/post/generate-draft-pass.ts`
  - `core/application/usecases/marketing/post/generate-enhance-pass.ts`

- [ ] Create orchestrator: `core/application/usecases/marketing/post/generate-post-multi-pass.ts`
- [ ] Update server action: `generatePostContentAction` to use multi-pass
- [ ] Update UI: Add step indicator for generation progress
- [ ] Add env var: `REDIS_CACHE_URL` (optional, fallback to memory)

**Estimate**: 6 hours

---

## TODO: Integration & Testing

### Tasks:
- [ ] Update PostForm.tsx:
  - Add "Configure Brand Voice" link
  - Add generation step progress UI
  - Add similarity warning if content is too similar
  - Add variation selection with preview

- [ ] Create server action: `checkContentSimilarityAction`
- [ ] Test complete flow:
  - Brand memory loading
  - Multi-pass generation
  - Similarity check
  - Embedding storage
  - Session cleanup

- [ ] Add tests:
  - Brand memory CRUD tests
  - Vector similarity tests
  - Multi-pass pipeline tests
  - Cache cleanup tests

**Estimate**: 4 hours

---

## Total Estimate: 17 hours (2-3 days)

**Breakdown**:
- Layer 1: 2h (UI sẵn có, chỉ migrate localStorage → MongoDB)
- Layer 2: 5h (Qdrant + embedding service)
- Layer 3: 6h (Multi-pass pipeline với cache)
- Integration & Testing: 4h

### Priority Order:
1. **Layer 1** (Structured Memory) - **Quick win** - UI sẵn, chỉ thêm backend
2. **Layer 3** (Multi-pass) - **Immediate quality boost** - Tăng chất lượng content ngay
3. **Layer 2** (Vector DB) - **Advanced anti-duplication** - Tính năng nâng cao

---