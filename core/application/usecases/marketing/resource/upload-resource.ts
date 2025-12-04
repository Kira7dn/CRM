/**
 * Upload Resource Use Case
 * Handles file upload to S3, text extraction, chunking, and embedding into VectorDB
 */

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

/**
 * UploadResourceUseCase
 * Orchestrates the complete resource upload workflow
 */
export class UploadResourceUseCase {
  private openai: OpenAI

  constructor(private resourceService: ResourceService) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required for embedding generation")
    }
    this.openai = new OpenAI({ apiKey })
  }

  async execute(request: UploadResourceRequest): Promise<UploadResourceResponse> {
    console.log(`[UploadResource] Starting upload for ${request.fileName}`)

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

    console.log(`[UploadResource] Uploaded to S3: ${uploadResult.url}`)

    // 2. Extract text from file
    let text: string
    if (request.fileType === "pdf") {
      text = await PDFParser.extractText(request.file)
      console.log(`[UploadResource] Extracted ${text.length} chars from PDF`)
    } else {
      text = request.file.toString("utf-8")
      console.log(`[UploadResource] Loaded ${text.length} chars from text file`)
    }

    // 3. Chunk text
    const chunks = DocumentChunker.chunk(text, { chunkSize: 1000, overlap: 200 })
    console.log(`[UploadResource] Created ${chunks.length} chunks`)

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

    console.log(`[UploadResource] Created resource in DB: ${resource.id}`)

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

      if ((i + 1) % 10 === 0 || i === chunks.length - 1) {
        console.log(`[UploadResource] Embedded ${i + 1}/${chunks.length} chunks`)
      }
    }

    console.log(`[UploadResource] Successfully uploaded resource: ${resource.id}`)

    return { resource, chunkCount: chunks.length }
  }

  /**
   * Get content type for file type
   */
  private getContentType(fileType: string): string {
    const types: Record<string, string> = {
      md: "text/markdown",
      txt: "text/plain",
      pdf: "application/pdf",
    }
    return types[fileType] || "application/octet-stream"
  }

  /**
   * Generate embedding using OpenAI
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float"
      })

      return response.data[0].embedding
    } catch (error) {
      console.error("[UploadResource] Failed to generate embedding:", error)
      throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
