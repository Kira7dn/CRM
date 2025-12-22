"use client";

import { useRef } from "react";
import { useFileUpload } from "@/lib/hooks/use-file-upload";
import { Image, Video, X, Loader2 } from "lucide-react";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import type { PostMedia } from "@/core/domain/marketing/post";

export interface MediaUploadProps {
  value?: PostMedia;
  onChange: (media: PostMedia | null) => void;
  folder?: string;
  maxSize?: number; // in MB (optional, uses type-based defaults)
  disabled?: boolean;
}

/**
 * MediaUpload - Compact button-based media upload component
 *
 * Features:
 * - Compact button interface for photo/video and reel uploads
 * - Auto-detects file type from MIME
 * - Returns PostMedia object with type and URL
 * - Type-specific size limits (200MB video, 10MB image)
 * - Preview display (image or video player)
 */
export function MediaUpload({
  value,
  onChange,
  folder = "media",
  maxSize,
  disabled = false,
}: MediaUploadProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Accept both images and videos
  const fileAccept = "image/*,video/*";

  // File type state (detected from uploaded file)
  const currentType = value?.type || null;

  const { isUploading, error, upload } = useFileUpload({
    fileType: currentType || "image", // Default for hook, but we override
    folder,
    onSuccess: () => { }, // We handle success manually in handleFileChange
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect media type from file MIME type
    const detectedType: 'image' | 'video' = file.type.startsWith('video/')
      ? 'video'
      : 'image';

    // Type-specific size limits
    const fileMaxSize = maxSize || (detectedType === 'video' ? 200 : 10);

    // Validate file size
    if (file.size > fileMaxSize * 1024 * 1024) {
      alert(`${detectedType === 'video' ? 'Video' : 'Image'} must be less than ${fileMaxSize}MB`);
      return;
    }

    try {
      // Upload to S3
      const result = await upload(file);

      if (result?.url) {
        // Return PostMedia object with detected type
        onChange({
          type: detectedType,
          url: result.url,
        });
      }
    } catch (err) {
      console.error('Upload failed:', err);
      // Error is already handled by useFileUpload hook
    }
  };

  const handleRemove = () => {
    onChange(null); // Pass null instead of empty string
    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {value?.url ? (
        <div className="relative border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
          {value.type === "video" ? (
            <video src={value.url} controls className="w-full max-h-48" />
          ) : (
            <img
              src={value.url}
              alt="Preview"
              className="w-full max-h-48 object-contain"
              loading="lazy"
            />
          )}
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={handleRemove}
            className="absolute top-2 right-2"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-3">
          {/* Photo/video button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => !disabled && !isUploading && photoInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="cursor-pointer flex items-center gap-2 rounded-full px-4 py-2 bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Image className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">Photo</span>
          </Button>

          {/* Reel button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => !disabled && !isUploading && videoInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="cursor-pointer flex items-center gap-2 rounded-full px-4 py-2 bg-pink-50 hover:bg-pink-100 dark:bg-pink-950 dark:hover:bg-pink-900 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300"
          >
            <Video className="h-4 w-4" />
            <span className="text-sm font-medium">Video</span>
          </Button>
        </div>
      )}

      {/* Hidden file inputs */}
      <Input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />
      <Input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
