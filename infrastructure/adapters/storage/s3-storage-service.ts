import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Supported file types for upload
 */
export type AllowedFileType = "image" | "video" | "document";

/**
 * File upload request
 */
export interface FileUploadRequest {
  file: Buffer | Blob;
  fileName: string;
  fileType: AllowedFileType;
  contentType: string;
  folder?: string; // Optional folder/prefix in S3
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  success: boolean;
  url?: string; // Public URL to the uploaded file
  key?: string; // S3 object key
  error?: string;
}

/**
 * S3 Storage Service Configuration
 */
export interface S3StorageConfig {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl?: string; // Custom domain for CloudFront or S3 public URL
}

/**
 * S3 Storage Service for file uploads
 * Handles image, video, and document uploads to AWS S3
 */
export class S3StorageService {
  private s3Client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(private config: S3StorageConfig) {
    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl || `https://${config.bucket}.s3.${config.region}.amazonaws.com`;
  }

  /**
   * Upload file to S3
   */
  async upload(request: FileUploadRequest): Promise<FileUploadResponse> {
    try {
      // Validate file type
      const allowedTypes = this.getAllowedContentTypes(request.fileType);
      if (!allowedTypes.includes(request.contentType)) {
        return {
          success: false,
          error: `Invalid content type. Allowed types for ${request.fileType}: ${allowedTypes.join(", ")}`,
        };
      }

      // Generate S3 key
      const key = this.generateKey(request.fileName, request.folder, request.fileType);

      // Convert to Buffer if necessary
      let buffer: Buffer;
      if (request.file instanceof Buffer) {
        buffer = request.file;
      } else if (request.file instanceof Blob) {
        buffer = Buffer.from(await request.file.arrayBuffer());
      } else {
        // Handle other cases if needed
        buffer = Buffer.from(request.file);
      }

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: request.contentType,
        // ACL: "public-read", // Make file publicly readable (optional, depends on your bucket policy)
      });

      await this.s3Client.send(command);

      const url = `${this.publicUrl}/${key}`;

      return {
        success: true,
        url,
        key,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during upload",
      };
    }
  }

  /**
   * Delete file from S3
   */
  async delete(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      console.error("Error deleting file from S3:", error);
      return false;
    }
  }

  /**
   * Get signed URL for private files
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Generate S3 key (path) for file
   */
  private generateKey(fileName: string, folder?: string, fileType?: AllowedFileType): string {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const prefix = folder || fileType || "uploads";

    return `${prefix}/${timestamp}-${sanitizedFileName}`;
  }

  /**
   * Get allowed content types for file type
   */
  private getAllowedContentTypes(fileType: AllowedFileType): string[] {
    const allowedTypes: Record<AllowedFileType, string[]> = {
      image: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
      video: ["video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo", "video/webm"],
      document: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
    };

    return allowedTypes[fileType] || [];
  }

  /**
   * Validate file size
   */
  validateFileSize(fileSize: number, fileType: AllowedFileType): boolean {
    const maxSizes: Record<AllowedFileType, number> = {
      image: 10 * 1024 * 1024, // 10 MB
      video: 500 * 1024 * 1024, // 500 MB
      document: 20 * 1024 * 1024, // 20 MB
    };

    return fileSize <= maxSizes[fileType];
  }
}

/**
 * Factory function to create S3StorageService
 * Uses environment variables for configuration
 */
export function createS3StorageService(): S3StorageService {
  const config: S3StorageConfig = {
    region: process.env.AWS_REGION || "us-east-1",
    bucket: process.env.AWS_S3_BUCKET || "",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    publicUrl: process.env.AWS_S3_PUBLIC_URL,
  };

  if (!config.bucket || !config.accessKeyId || !config.secretAccessKey) {
    throw new Error("Missing required AWS S3 configuration. Please set AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY environment variables.");
  }

  return new S3StorageService(config);
}
