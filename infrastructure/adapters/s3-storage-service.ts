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
   * Get allowed content types for file type
   */
  private getAllowedContentTypes(fileType: AllowedFileType): string[] {
    const allowedTypes: Record<AllowedFileType, string[]> = {
      image: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml'
      ],
      video: [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
        'video/x-ms-wmv'
      ],
      document: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
        'application/octet-stream' // Fallback for unknown types
      ]
    };
    return allowedTypes[fileType] || [];
  }

  /**
   * Validate content type against allowed types
   */
  private isValidContentType(contentType: string, fileType: AllowedFileType): boolean {
    if (!contentType) return false;

    const normalizedContentType = contentType.toLowerCase();
    const allowedTypes = this.getAllowedContentTypes(fileType);

    // Check for exact match or type/* match (e.g., image/*)
    return allowedTypes.some(type => {
      const [typeCategory] = type.split('/');
      return (
        normalizedContentType === type ||
        normalizedContentType.startsWith(`${typeCategory}/`)
      );
    });
  }

  /**
   * Sanitize filename by removing special characters and normalizing
   */
  private sanitizeFilename(filename: string): string {
    // Remove accents/diacritics
    const normalized = filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    // Replace special characters with hyphen, keep alphanumeric, hyphen, dot and underscore
    return normalized
      .replace(/[^a-z0-9\-_.]/g, '-')  // Replace special chars with hyphen
      .replace(/-+/g, '-')             // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, '')         // Remove leading/trailing hyphens
      .trim();
  }

  /**
   * Generate S3 key with sanitized filename
   */
  private generateKey(fileName: string, folder?: string, fileType?: AllowedFileType): string {
    const safeFolder = folder ? this.sanitizeFilename(folder) + '/' : '';
    const timestamp = Date.now();
    const sanitized = this.sanitizeFilename(fileName);
    return `${safeFolder}${timestamp}-${sanitized}`;
  }

  /**
   * Upload file to S3
   */
  async upload(request: FileUploadRequest): Promise<FileUploadResponse> {
    console.log('upload S3 with request', request);

    try {
      // Normalize content type
      const contentType = request.contentType.toLowerCase();

      // Validate file type
      if (!this.isValidContentType(contentType, request.fileType)) {
        const allowedTypes = this.getAllowedContentTypes(request.fileType);
        return {
          success: false,
          error: `Invalid content type. Allowed types for ${request.fileType}: ${allowedTypes.join(", ")}`,
        };
      }

      // Generate S3 key with sanitized filename
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

      // Upload to S3 with proper content type and metadata
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ContentDisposition: 'inline',
        CacheControl: 'public, max-age=31536000',
        Metadata: {
          'original-filename': key.split('/').pop() || 'file',
          'uploaded-at': new Date().toISOString()
        }
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
  // In development, use mock service if AWS credentials are not set
  if (process.env.NODE_ENV === 'development' &&
    (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY)) {
    console.warn('⚠️ AWS credentials not found. Using mock S3 service in development mode.');
    return {
      upload: async () => ({
        success: true,
        url: 'https://example.com/mock-upload.jpg',
        key: 'mock-upload.jpg'
      }),
      delete: async () => true,
      getSignedUrl: async () => 'https://example.com/mock-signed-url.jpg',
      validateFileSize: () => true
    } as unknown as S3StorageService;
  }
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
