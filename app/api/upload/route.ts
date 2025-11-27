import { NextResponse } from "next/server";
import { createS3StorageService } from "@/infrastructure/adapters/storage/s3-storage-service";
import type { AllowedFileType } from "@/infrastructure/adapters/storage/s3-storage-service";

const getContentTypeFromExtension = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    csv: 'text/csv',
  };
  return mimeTypes[extension as keyof typeof mimeTypes] || 'application/octet-stream';
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    let fileType = formData.get("fileType") as AllowedFileType | null;
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    if (!fileType) {
      if (file.type.startsWith("image/")) fileType = "image";
      else if (file.type.startsWith("video/")) fileType = "video";
      else fileType = "document";
    }

    const contentType = file.type || getContentTypeFromExtension(file.name);
    const s3Service = createS3StorageService();

    if (!s3Service.validateFileSize(file.size, fileType)) {
      return NextResponse.json(
        { success: false, error: `File size too large for type ${fileType}` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await s3Service.upload({
      file: buffer,
      fileName: file.name,
      fileType,
      contentType,
      folder: folder || undefined,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        url: result.url,
        key: result.key,
        fileName: file.name,
        fileSize: file.size,
        fileType: contentType,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ success: false, error: "No file key provided" }, { status: 400 });
    }

    const s3Service = createS3StorageService();
    const success = await s3Service.delete(key);

    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete file" },
      { status: 500 }
    );
  }
}

export function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}
