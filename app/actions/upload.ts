"use server"

import { createS3StorageService } from "@/infrastructure/adapters/s3-storage-service"
import type { AllowedFileType } from "@/infrastructure/adapters/s3-storage-service"

export interface UploadResponse {
  success: boolean
  url?: string
  key?: string
  fileName?: string
  fileSize?: number
  fileType?: string
  error?: string
}

interface UploadFilePayload {
  name: string;
  type: string;
  buffer: number[];
  fileType: AllowedFileType;
  folder?: string;
}

export async function uploadFileAction(payload: UploadFilePayload): Promise<UploadResponse> {
  console.log('[uploadFileAction] Starting file upload process');

  try {
    // Log the incoming payload (without the buffer for brevity)
    console.log('[uploadFileAction] Received payload:', {
      name: payload.name,
      type: payload.type,
      bufferLength: payload.buffer?.length,
      fileType: payload.fileType,
      folder: payload.folder
    });

    // Validate required fields
    if (!payload.buffer || !Array.isArray(payload.buffer)) {
      const errorMsg = 'Invalid file data: buffer must be an array';
      console.error('[uploadFileAction]', errorMsg);
      return { success: false, error: errorMsg };
    }

    // Process the file data
    const buffer = Buffer.from(payload.buffer);
    const fileSize = buffer.length;
    const fileName = payload.name || 'unnamed';
    const fileType = payload.fileType;
    const folder = payload.folder || 'uploads';
    const contentType = payload.type || 'application/octet-stream';

    console.log('[uploadFileAction] Processing file:', {
      fileName,
      fileSize,
      fileType,
      contentType,
      folder
    });

    const s3Service = createS3StorageService();

    // Validate file size
    if (!s3Service.validateFileSize(fileSize, fileType)) {
      const errorMsg = `File size (${(fileSize / 1024 / 1024).toFixed(2)}MB) exceeds maximum for ${fileType}`;
      console.error('[uploadFileAction]', errorMsg);
      return { success: false, error: errorMsg };
    }

    // Upload to S3
    console.log('[uploadFileAction] Uploading to S3...');
    const result = await s3Service.upload({
      file: buffer,
      fileName,
      fileType,
      contentType,
      folder
    });

    if (!result.success) {
      console.error('[uploadFileAction] Upload failed:', result.error);
      return {
        success: false,
        error: result.error || 'Upload failed'
      };
    }

    console.log('[uploadFileAction] Upload successful:', {
      url: result.url,
      key: result.key,
      fileSize
    });

    return {
      success: true,
      url: result.url,
      key: result.key,
      fileName,
      fileSize,
      fileType,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[uploadFileAction] Error:', {
      error: errorMsg,
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      success: false,
      error: errorMsg,
    };
  }
}

export async function deleteFileAction(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!key) {
      return { success: false, error: "No file key provided" }
    }

    const s3Service = createS3StorageService()
    const success = await s3Service.delete(key)

    return { success }
  } catch (error) {
    console.error("Delete error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete file",
    }
  }
}