import { NextRequest, NextResponse } from "next/server";
import { createS3StorageService } from "@/infrastructure/adapters/storage/s3-storage-service";
import type { AllowedFileType } from "@/infrastructure/adapters/storage/s3-storage-service";

/**
 * POST /api/upload
 * Upload file to S3
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileType = formData.get("fileType") as AllowedFileType;
    const folder = formData.get("folder") as string | undefined;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!fileType || !["image", "video", "document"].includes(fileType)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Must be 'image', 'video', or 'document'" },
        { status: 400 }
      );
    }

    // Create S3 service
    const s3Service = createS3StorageService();

    // Validate file size
    if (!s3Service.validateFileSize(file.size, fileType)) {
      return NextResponse.json(
        { success: false, error: `File size exceeds maximum allowed for ${fileType}` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    const result = await s3Service.upload({
      file: buffer,
      fileName: file.name,
      fileType,
      contentType: file.type,
      folder,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload
 * Delete file from S3
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { success: false, error: "No file key provided" },
        { status: 400 }
      );
    }

    const s3Service = createS3StorageService();
    const success = await s3Service.delete(key);

    return NextResponse.json({ success });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
