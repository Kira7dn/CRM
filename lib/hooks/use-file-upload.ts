"use client";

import { useState } from "react";
import type { AllowedFileType } from "@/infrastructure/adapters/storage/s3-storage-service";

export interface UseFileUploadOptions {
  fileType: AllowedFileType;
  folder?: string;
  onSuccess?: (url: string, key: string) => void;
  onError?: (error: string) => void;
}

export interface FileUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  url: string | null;
  key: string | null;
}

/**
 * React hook for file upload to S3
 */
export function useFileUpload(options: UseFileUploadOptions) {
  const [state, setState] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    url: null,
    key: null,
  });

  const upload = async (file: File) => {
    setState({
      isUploading: true,
      progress: 0,
      error: null,
      url: null,
      key: null,
    });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", options.fileType);
      if (options.folder) {
        formData.append("folder", options.folder);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      setState({
        isUploading: false,
        progress: 100,
        error: null,
        url: result.url,
        key: result.key,
      });

      if (options.onSuccess) {
        options.onSuccess(result.url, result.key);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setState({
        isUploading: false,
        progress: 0,
        error: errorMessage,
        url: null,
        key: null,
      });

      if (options.onError) {
        options.onError(errorMessage);
      }

      throw error;
    }
  };

  const deleteFile = async (key: string) => {
    try {
      const response = await fetch(`/api/upload?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error("Delete failed");
      }

      setState({
        isUploading: false,
        progress: 0,
        error: null,
        url: null,
        key: null,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));

      throw error;
    }
  };

  const reset = () => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      url: null,
      key: null,
    });
  };

  return {
    ...state,
    upload,
    deleteFile,
    reset,
  };
}
