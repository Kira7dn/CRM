"use client";

import { useRef, useState } from "react";
import { useFileUpload } from "@/lib/hooks/use-file-upload";

import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@shared/ui/button";
import { Label } from "@shared/ui/label";
import { Input } from "@shared/ui/input";

export interface ImageUploadProps {
  value?: string; // Current image URL
  onChange: (url: string, key?: string) => void;
  folder?: string;
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

/**
 * Reusable Image Upload Component
 * Handles image upload to S3 with preview
 */
export function ImageUpload({
  value,
  onChange,
  folder = "images",
  label = "Image",
  accept = "image/*",
  maxSize = 10,
  disabled = false,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);

  const { isUploading, error, upload, deleteFile } = useFileUpload({
    fileType: "image",
    folder,
    onSuccess: (url, key) => {
      setPreview(url);
      onChange(url, key);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Create local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to S3
    try {
      await upload(file);
    } catch (error) {
      console.error("Upload failed:", error);
      setPreview(value || null);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      {preview ? (
        <div className="relative w-full h-48 border rounded-lg overflow-hidden group">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized={preview.startsWith("data:")}
          />
          {!disabled && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClick}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Change
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={!disabled ? handleClick : undefined}
          className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center ${!disabled ? "cursor-pointer hover:border-primary transition-colors" : "opacity-50"
            }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click to upload image</p>
              <p className="text-xs text-muted-foreground mt-1">
                Max size: {maxSize}MB
              </p>
            </>
          )}
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
