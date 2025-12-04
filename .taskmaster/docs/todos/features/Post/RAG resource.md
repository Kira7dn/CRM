# RAG Resource Upload - TODO

## Mô tả
Upload tài liệu (.md, .txt, .pdf) lên S3, lưu metadata vào MongoDB, chunking và đưa vào VectorDB để RAG sử dụng.

---

## TODO List

### Phase 1: Domain & Repository
- [ ] **1.1** Tạo domain entity `Resource` trong `core/domain/marketing/resource.ts`
- [ ] **1.2** Tạo interface `ResourceService` trong `core/application/interfaces/marketing/resource-service.ts`
- [ ] **1.3** Tạo `ResourceRepository` trong `infrastructure/repositories/marketing/resource-repo.ts`

### Phase 2: Document Processing Use Cases
- [ ] **2.1** Tạo `UploadResourceUseCase` - upload file lên S3, lưu DB, chunking, embed vào VectorDB
- [ ] **2.2** Tạo `GetResourcesUseCase` - lấy danh sách resources
- [ ] **2.3** Tạo `DeleteResourceUseCase` - xóa file S3, DB record, vector embeddings

### Phase 3: Utility Services & VectorDB Updates
- [ ] **3.1** Tạo `DocumentChunker` utility - chunking text với overlap
- [ ] **3.2** Tạo `PDFParser` utility - extract text từ PDF
- [ ] **3.3** Update `VectorDBService` - thêm `contentType`, metadata `resourceId`, `chunkIndex`
- [ ] **3.4** Update `RetrieveKnowledgeUseCase` - filter chỉ search `knowledge_resource`

### Phase 4: API Routes & UI
- [ ] **4.1** Tạo API route `app/api/resources/route.ts` (GET, POST)
- [ ] **4.2** Tạo API route `app/api/resources/[id]/route.ts` (DELETE)
- [ ] **4.3** Tạo UI component `ResourceUploader` trong Post page
- [ ] **4.4** Hiển thị danh sách resources đã upload

---

## Code Implementation

### Phase 1.1: Domain Entity

**File: `core/domain/marketing/resource.ts`** (NEW)

```ts
export interface Resource {
  id: string
  userId: string
  name: string
  fileType: "md" | "txt" | "pdf"
  s3Url: string
  s3Key: string
  size: number
  chunkCount: number
  uploadedAt: Date
}

export function validateResource(resource: Partial<Resource>): string[] {
  const errors: string[] = []
  if (!resource.name) errors.push("Name is required")
  if (!resource.fileType) errors.push("File type is required")
  if (!resource.s3Url) errors.push("S3 URL is required")
  return errors
}
```

### Phase 1.2: Service Interface

**File: `core/application/interfaces/marketing/resource-service.ts`** (NEW)

```ts
import type { Resource } from "@/core/domain/marketing/resource"

export interface ResourcePayload extends Partial<Resource> {}

export interface ResourceService {
  getAll(userId: string): Promise<Resource[]>
  getById(id: string): Promise<Resource | null>
  create(payload: ResourcePayload): Promise<Resource>
  delete(id: string): Promise<boolean>
}
```

### Phase 1.3: Repository

**File: `infrastructure/repositories/marketing/resource-repo.ts`** (NEW)

```ts
import { BaseRepository } from "@/infrastructure/db/base-repository"
import { Resource } from "@/core/domain/marketing/resource"
import type { ResourceService, ResourcePayload } from "@/core/application/interfaces/marketing/resource-service"
import { ObjectId } from "mongodb"

export class ResourceRepository extends BaseRepository<Resource, string> implements ResourceService {
  protected collectionName = "resources"

  async getAll(userId: string): Promise<Resource[]> {
    const collection = await this.getCollection()
    const docs = await collection.find({ userId }).sort({ uploadedAt: -1 }).toArray()
    return docs.map(doc => this.toDomain(doc))
  }

  async getById(id: string): Promise<Resource | null> {
    const collection = await this.getCollection()
    const doc = await collection.findOne({ _id: new ObjectId(id) } as any)
    return doc ? this.toDomain(doc) : null
  }

  async create(payload: ResourcePayload): Promise<Resource> {
    const doc: any = {
      userId: payload.userId,
      name: payload.name,
      fileType: payload.fileType,
      s3Url: payload.s3Url,
      s3Key: payload.s3Key,
      size: payload.size,
      chunkCount: payload.chunkCount || 0,
      uploadedAt: new Date(),
    }

    const collection = await this.getCollection()
    const { insertedId } = await collection.insertOne(doc)
    doc._id = insertedId
    return this.toDomain(doc)
  }

  async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(id) } as any)
    return result.deletedCount > 0
  }

  protected toDomain(doc: any): Resource {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      name: doc.name,
      fileType: doc.fileType,
      s3Url: doc.s3Url,
      s3Key: doc.s3Key,
      size: doc.size,
      chunkCount: doc.chunkCount,
      uploadedAt: doc.uploadedAt,
    }
  }
}
```

---

### Phase 2.1: Upload Resource Use Case

**File: `core/application/usecases/marketing/resource/upload-resource.ts`** (NEW)

```ts
import type { ResourceService } from "@/core/application/interfaces/marketing/resource-service"
import type { Resource } from "@/core/domain/marketing/resource"
import { createS3StorageService } from "@/infrastructure/adapters/storage/s3-storage-service"
import { getVectorDBService } from "@/infrastructure/adapters/vector-db"
import { DocumentChunker } from "@/infrastructure/utils/document-chunker"
import { PDFParser } from "@/infrastructure/utils/pdf-parser"
import OpenAI from "openai"

export interface UploadResourceRequest {
  userId: string
  file: Buffer
  fileName: string
  fileType: "md" | "txt" | "pdf"
}

export interface UploadResourceResponse {
  resource: Resource
  chunkCount: number
}

export class UploadResourceUseCase {
  private openai: OpenAI

  constructor(private resourceService: ResourceService) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }

  async execute(request: UploadResourceRequest): Promise<UploadResourceResponse> {
    // 1. Upload to S3
    const s3Service = createS3StorageService()
    const uploadResult = await s3Service.upload({
      file: request.file,
      fileName: request.fileName,
      fileType: "document",
      contentType: this.getContentType(request.fileType),
      folder: "resources",
    })

    if (!uploadResult.success) {
      throw new Error(`Failed to upload to S3: ${uploadResult.error}`)
    }

    // 2. Extract text from file
    let text: string
    if (request.fileType === "pdf") {
      text = await PDFParser.extractText(request.file)
    } else {
      text = request.file.toString("utf-8")
    }

    // 3. Chunk text
    const chunks = DocumentChunker.chunk(text, { chunkSize: 1000, overlap: 200 })

    // 4. Create resource in DB
    const resource = await this.resourceService.create({
      userId: request.userId,
      name: request.fileName,
      fileType: request.fileType,
      s3Url: uploadResult.url!,
      s3Key: uploadResult.key!,
      size: request.file.length,
      chunkCount: chunks.length,
    })

    // 5. Generate embeddings and store in VectorDB
    const vectorDB = getVectorDBService()

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await this.generateEmbedding(chunks[i])

      await vectorDB.storeEmbedding({
        id: `${resource.id}-chunk-${i}`,
        postId: resource.id, // Reuse postId field for resourceId
        content: chunks[i],
        embedding,
        metadata: {
          contentType: "knowledge_resource",  // CRITICAL: Mark as knowledge resource
          title: request.fileName,
          resourceId: resource.id,
          chunkIndex: i,
          fileType: request.fileType,
        },
        createdAt: new Date(),
      })
    }

    return { resource, chunkCount: chunks.length }
  }

  private getContentType(fileType: string): string {
    const types = {
      md: "text/markdown",
      txt: "text/plain",
      pdf: "application/pdf",
    }
    return types[fileType as keyof typeof types] || "application/octet-stream"
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    })
    return response.data[0].embedding
  }
}
```

### Phase 2.2 & 2.3: Get & Delete Use Cases

**File: `core/application/usecases/marketing/resource/get-resources.ts`** (NEW)

```ts
import type { ResourceService } from "@/core/application/interfaces/marketing/resource-service"
import type { Resource } from "@/core/domain/marketing/resource"

export class GetResourcesUseCase {
  constructor(private resourceService: ResourceService) {}

  async execute(userId: string): Promise<{ resources: Resource[] }> {
    const resources = await this.resourceService.getAll(userId)
    return { resources }
  }
}
```

**File: `core/application/usecases/marketing/resource/delete-resource.ts`** (NEW)

```ts
import type { ResourceService } from "@/core/application/interfaces/marketing/resource-service"
import { createS3StorageService } from "@/infrastructure/adapters/storage/s3-storage-service"
import { getVectorDBService } from "@/infrastructure/adapters/vector-db"

export class DeleteResourceUseCase {
  constructor(private resourceService: ResourceService) {}

  async execute(resourceId: string): Promise<{ success: boolean }> {
    const resource = await this.resourceService.getById(resourceId)
    if (!resource) throw new Error("Resource not found")

    // 1. Delete from S3
    const s3Service = createS3StorageService()
    await s3Service.delete(resource.s3Key)

    // 2. Delete embeddings from VectorDB
    const vectorDB = getVectorDBService()
    for (let i = 0; i < resource.chunkCount; i++) {
      await vectorDB.deleteEmbedding(`${resourceId}-chunk-${i}`)
    }

    // 3. Delete from DB
    await this.resourceService.delete(resourceId)

    return { success: true }
  }
}
```

---

### Phase 3.1: Document Chunker

**File: `infrastructure/utils/document-chunker.ts`** (NEW)

```ts
export interface ChunkOptions {
  chunkSize: number
  overlap: number
}

export class DocumentChunker {
  static chunk(text: string, options: ChunkOptions): string[] {
    const { chunkSize, overlap } = options
    const chunks: string[] = []

    let start = 0
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length)
      chunks.push(text.slice(start, end))
      start += chunkSize - overlap
    }

    return chunks
  }
}
```

### Phase 3.2: PDF Parser

**File: `infrastructure/utils/pdf-parser.ts`** (NEW)

```ts
import pdf from "pdf-parse"

export class PDFParser {
  static async extractText(buffer: Buffer): Promise<string> {
    const data = await pdf(buffer)
    return data.text
  }
}
```

**Dependency:** `npm install pdf-parse @types/pdf-parse`

### Phase 3.3: Update VectorDB Metadata & Content Type Filter

**QUAN TRỌNG:** Thêm `contentType` để phân biệt published posts vs knowledge resources

Update `ContentEmbedding` interface trong `infrastructure/adapters/vector-db.ts`:

```ts
export type ContentType = "published_post" | "knowledge_resource" | "draft_content"

export interface ContentEmbedding {
  id: string
  postId: string // Có thể là postId hoặc resourceId
  content: string
  embedding: number[]
  metadata: {
    contentType: ContentType    // NEW: Phân biệt loại content
    platform?: string
    topic?: string
    title?: string
    score?: number
    resourceId?: string         // NEW: Resource ID (nếu là knowledge_resource)
    chunkIndex?: number         // NEW: Chunk index (nếu là knowledge_resource)
    fileType?: string           // NEW: File type (nếu là knowledge_resource)
  }
  createdAt: Date
}
```

Update `storeEmbedding` method:

```ts
await this.client.upsert(this.collectionName, {
  wait: true,
  points: [
    {
      id: pointId,
      vector: embedding.embedding,
      payload: {
        embeddingId: embedding.id,
        postId: embedding.postId,
        content: embedding.content,
        contentType: embedding.metadata.contentType,        // NEW: Required field
        platform: embedding.metadata.platform || null,
        topic: embedding.metadata.topic || null,
        title: embedding.metadata.title || null,
        resourceId: embedding.metadata.resourceId || null,  // NEW
        chunkIndex: embedding.metadata.chunkIndex || null,  // NEW
        fileType: embedding.metadata.fileType || null,      // NEW
        createdAt: embedding.createdAt.toISOString(),
      },
    },
  ],
})
```

Update `searchSimilar` method signature:

```ts
async searchSimilar(
  queryEmbedding: number[],
  options: {
    limit?: number
    scoreThreshold?: number
    contentType?: ContentType | ContentType[]  // NEW: Filter by content type
    filter?: Record<string, any>
  } = {}
): Promise<SimilarityResult[]> {
  const { limit = 5, scoreThreshold = 0.7, contentType, filter } = options

  // Build filter with contentType
  let qdrantFilter = filter
  if (contentType) {
    const types = Array.isArray(contentType) ? contentType : [contentType]
    qdrantFilter = {
      ...filter,
      must: [
        ...(filter?.must || []),
        {
          key: "contentType",
          match: { any: types }
        }
      ]
    }
  }

  const results = await this.client.search(this.collectionName, {
    vector: queryEmbedding,
    limit,
    score_threshold: scoreThreshold,
    filter: qdrantFilter,
    with_payload: true,
  })
  // ... rest of method
}
```

### Phase 3.4: Update RetrieveKnowledgeUseCase

**File: `core/application/usecases/marketing/post/retrieve-knowledge.ts`** (UPDATE)

Update `execute` method để filter chỉ knowledge resources:

```ts
async execute(request: RetrieveKnowledgeRequest): Promise<RetrieveKnowledgeResponse> {
  try {
    const vectorDB = getVectorDBService()

    // Generate embedding for topic
    const embedding = await this.generateEmbedding(request.topic)

    // Search similar content in vector DB - ONLY knowledge resources
    const results = await vectorDB.searchSimilar(embedding, {
      limit: request.limit || 5,
      scoreThreshold: 0.7,
      contentType: "knowledge_resource"  // NEW: Filter chỉ lấy knowledge resources
    })

    // Build context from results
    if (results.length === 0) {
      return {
        context: 'No relevant knowledge found in database.',
        sources: []
      }
    }

    const context = results.map((r, idx) => {
      const preview = r.content.length > 200 ? r.content.slice(0, 200) + '...' : r.content
      return `[${idx + 1}] ${r.metadata.title || 'Untitled'}
${preview}
(Similarity: ${(r.score * 100).toFixed(1)}%)`
    }).join('\n\n')

    return {
      context,
      sources: results.map(r => ({
        postId: r.postId,
        title: r.metadata.title || 'Untitled',
        content: r.content,
        similarity: r.score
      }))
    }
  } catch (error) {
    console.error('[RAG] Failed to retrieve knowledge:', error)
    // Fallback: return empty context
    return {
      context: '',
      sources: []
    }
  }
}
```

---

### Phase 4: API Routes & UI

**File: `app/api/resources/route.ts`** (NEW)

```ts
import { NextRequest, NextResponse } from "next/server"
import { getResourcesUseCase, uploadResourceUseCase } from "./depends"

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id") // Or get from session
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const useCase = await getResourcesUseCase()
  const result = await useCase.execute(userId)
  return NextResponse.json(result.resources)
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get("file") as File
  const fileType = formData.get("fileType") as "md" | "txt" | "pdf"

  const buffer = Buffer.from(await file.arrayBuffer())

  const useCase = await uploadResourceUseCase()
  const result = await useCase.execute({
    userId,
    file: buffer,
    fileName: file.name,
    fileType,
  })

  return NextResponse.json(result)
}
```

**File: `app/api/resources/depends.ts`** (NEW)

```ts
import { ResourceRepository } from "@/infrastructure/repositories/marketing/resource-repo"
import { UploadResourceUseCase } from "@/core/application/usecases/marketing/resource/upload-resource"
import { GetResourcesUseCase } from "@/core/application/usecases/marketing/resource/get-resources"
import { DeleteResourceUseCase } from "@/core/application/usecases/marketing/resource/delete-resource"

const getResourceService = async () => new ResourceRepository()

export const uploadResourceUseCase = async () => {
  const service = await getResourceService()
  return new UploadResourceUseCase(service)
}

export const getResourcesUseCase = async () => {
  const service = await getResourceService()
  return new GetResourcesUseCase(service)
}

export const deleteResourceUseCase = async () => {
  const service = await getResourceService()
  return new DeleteResourceUseCase(service)
}
```

**File: `app/api/resources/[id]/route.ts`** (NEW)

```ts
import { NextRequest, NextResponse } from "next/server"
import { deleteResourceUseCase } from "../depends"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const useCase = await deleteResourceUseCase()
  const result = await useCase.execute(id)
  return NextResponse.json(result)
}
```

**File: `app/(features)/crm/campaigns/posts/_components/ResourceUploader.tsx`** (NEW)

```tsx
"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Trash2 } from "lucide-react"
import type { Resource } from "@/core/domain/marketing/resource"

export default function ResourceUploader({ userId }: { userId: string }) {
  const [resources, setResources] = useState<Resource[]>([])
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split(".").pop()?.toLowerCase()
    if (!["md", "txt", "pdf"].includes(ext!)) {
      alert("Only .md, .txt, .pdf files allowed")
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("fileType", ext!)

    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        body: formData,
        headers: { "x-user-id": userId },
      })
      const result = await res.json()
      setResources([...resources, result.resource])
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/resources/${id}`, { method: "DELETE" })
    setResources(resources.filter(r => r.id !== id))
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="resource-upload" className="cursor-pointer">
          <Button type="button" disabled={uploading} asChild>
            <span>
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Resource"}
            </span>
          </Button>
        </label>
        <input
          id="resource-upload"
          type="file"
          accept=".md,.txt,.pdf"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      <div className="space-y-2">
        {resources.map(r => (
          <div key={r.id} className="flex items-center justify-between p-2 border rounded">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{r.name}</span>
              <span className="text-xs text-muted-foreground">
                ({r.chunkCount} chunks)
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(r.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Update: `app/(features)/crm/campaigns/posts/page.tsx`**

Thêm ResourceUploader vào Post page (bên cạnh PostForm).

---

## Dependencies

```bash
npm install pdf-parse @types/pdf-parse
```

---

## Environment Variables

```env
# Already configured
QDRANT_URL=https://...
QDRANT_API_KEY=...
OPENAI_API_KEY=sk-...
AWS_S3_BUCKET=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

---

## Testing

1. Upload `.md` file → verify S3 upload, DB record, VectorDB chunks
2. Upload `.pdf` file → verify PDF parsing works
3. Search RAG với topic liên quan → verify chunks được retrieve
4. Delete resource → verify S3, DB, VectorDB đều xóa

---

## Notes

### Content Type Strategy

**VectorDB hiện tại không phân biệt được:**
- Published posts (đã đăng lên platforms) → tránh trùng lặp
- Knowledge resources (documents để RAG tham khảo)

**Giải pháp: `contentType` field**
- `"published_post"` - Post đã publish (từ CreatePostUseCase)
- `"knowledge_resource"` - Document upload (từ UploadResourceUseCase)
- `"draft_content"` - Draft chưa publish (optional, future)

**RAG Filter:**
- `RetrieveKnowledgeUseCase` chỉ search `contentType: "knowledge_resource"`
- Tránh retrieve lại published posts (gây trùng lặp content)
- Knowledge resources là nguồn tham khảo, không phải content đã đăng

**Future: Published Post Embeddings**
- Khi CreatePostUseCase publish post thành công
- Có thể embed content với `contentType: "published_post"`
- Dùng để phát hiện duplicate content trước khi publish
- Search với filter: `contentType: ["published_post"]` → kiểm tra similarity
- Nếu similarity > 0.9 → cảnh báo "content tương tự đã đăng"

### Technical Details

- Chunk size: 1000 chars, overlap: 200 chars (có thể tune)
- VectorDB metadata sử dụng `resourceId` để tracking resources
- PDF parsing dùng `pdf-parse` library (simple, reliable)
- S3 folder: `resources/` để tách biệt với media files
- Metadata fields mở rộng trong VectorDB để hỗ trợ resource tracking
