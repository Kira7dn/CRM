/**
 * Upload Resource Use Case
 * Handles file upload to S3, text extraction, chunking, and embedding into VectorDB
 */

import type { ResourceService } from "@/core/application/usecases/marketing/post/resource/resource-service.interfaces"
import type { Resource } from "@/core/domain/marketing/resource"
import { createS3StorageService } from "@/infrastructure/adapters/s3-storage-service"
import { DocumentChunker } from "@/infrastructure/utils/document-chunker"
import { PDFParser } from "@/infrastructure/utils/pdf-parser"
import { StoreContentEmbeddingUseCase } from "../content-memory/store-content-embedding"

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

  constructor(
    private resourceService: ResourceService,
    private storeContentUsecase: StoreContentEmbeddingUseCase,
  ) {
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

    for (let i = 0; i < chunks.length; i++) {
      const params = {
        embeddingCategory: "knowledge_resource" as const,
        resourceId: resource.id,
        content: chunks[i],
        title: `${request.fileName}`,
        chunkIndex: i,
      }
      const result = await this.storeContentUsecase.execute(params)
      console.log("[UploadResource] Embedded chunk", result.success)

      if (result.success && (i + 1) % 10 === 0 || i === chunks.length - 1) {
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
}
