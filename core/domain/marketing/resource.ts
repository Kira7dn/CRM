/**
 * Resource Domain Entity
 * Represents an uploaded knowledge resource (document) for RAG
 */

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

/**
 * Validate resource data
 * @param resource Partial resource object to validate
 * @returns Array of validation error messages
 */
export function validateResource(resource: Partial<Resource>): string[] {
  const errors: string[] = []

  if (!resource.name) {
    errors.push("Name is required")
  }

  if (!resource.fileType) {
    errors.push("File type is required")
  } else if (!["md", "txt", "pdf"].includes(resource.fileType)) {
    errors.push("File type must be md, txt, or pdf")
  }

  if (!resource.s3Url) {
    errors.push("S3 URL is required")
  }

  if (!resource.s3Key) {
    errors.push("S3 Key is required")
  }

  if (!resource.userId) {
    errors.push("User ID is required")
  }

  return errors
}
