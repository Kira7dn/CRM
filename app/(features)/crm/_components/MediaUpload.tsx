"use client";

import { useRef } from "react";
import { useFileUpload } from "@/lib/hooks/use-file-upload";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";

export interface MediaUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  type?: "image" | "video";
  maxSize?: number; // in MB
  disabled?: boolean;
}

export function MediaUpload({
  value,
  onChange,
  folder = "media",
  type = "image",
  maxSize,
  disabled = false,
}: MediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileAccept = type === "video" ? "video/*" : "image/*";
  const fileMaxSize = maxSize || (type === "video" ? 500 : 10);

  const { isUploading, error, upload } = useFileUpload({
    fileType: type,
    folder,
    onSuccess: (url) => onChange(url),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > fileMaxSize * 1024 * 1024) {
      alert(`File must be less than ${fileMaxSize}MB`);
      return;
    }

    await upload(file);
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
          {type === "video" ? (
            <video src={value} controls className="w-full max-h-96" />
          ) : (
            <img src={value} alt="Preview" className="w-full max-h-96 object-contain" />
          )}
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => {
              onChange("");
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center ${
            !disabled && !isUploading ? "cursor-pointer hover:border-primary" : "opacity-50"
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Click to upload {type}</p>
              <p className="text-xs text-muted-foreground mt-1">Max {fileMaxSize}MB</p>
            </>
          )}
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept={fileAccept}
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
