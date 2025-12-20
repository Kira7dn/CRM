"use client";

import { useState } from "react";
import type { AllowedFileType } from "@/infrastructure/adapters/s3-storage-service";
import { uploadFileAction, deleteFileAction } from "@/app/actions/upload";

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
    console.log('[useFileUpload] Starting file upload process', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    });

    // Validate file exists and is a proper File object
    if (!file || !(file instanceof File)) {
      const errorMessage = "No file selected or invalid file";
      console.error('[useFileUpload] Invalid file:', { file });
      setState({
        isUploading: false,
        progress: 0,
        error: errorMessage,
        url: null,
        key: null,
      });
      throw new Error(errorMessage);
    }

    console.log('[useFileUpload] Setting upload state to loading');
    setState({
      isUploading: true,
      progress: 0,
      error: null,
      url: null,
      key: null,
    });

    try {
      // Convert file to ArrayBuffer
      console.log('[useFileUpload] Converting file to ArrayBuffer');
      const arrayBuffer = await file.arrayBuffer();
      const bufferArray = Array.from(new Uint8Array(arrayBuffer));

      console.log('[useFileUpload] Prepared file data for upload:', {
        name: file.name,
        type: file.type,
        bufferLength: bufferArray.length,
        fileType: options.fileType,
        folder: options.folder
      });

      // Call Server Action with file data
      console.log('[useFileUpload] Calling uploadFileAction');
      const result = await uploadFileAction({
        name: file.name,
        type: file.type,
        buffer: bufferArray,
        fileType: options.fileType,
        folder: options.folder,
      });

      if (!result.success) {
        console.error('[useFileUpload] Upload failed:', result.error);
        throw new Error(result.error || "Upload failed");
      }

      console.log('[useFileUpload] Upload successful:', {
        url: result.url,
        key: result.key,
        fileName: result.fileName,
        fileSize: result.fileSize
      });

      setState({
        isUploading: false,
        progress: 100,
        error: null,
        url: result.url || null,
        key: result.key || null,
      });

      if (options.onSuccess && result.url && result.key) {
        console.log('[useFileUpload] Calling onSuccess callback');
        options.onSuccess(result.url, result.key);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error('[useFileUpload] Error during upload:', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });

      setState({
        isUploading: false,
        progress: 0,
        error: errorMessage,
        url: null,
        key: null,
      });

      if (options.onError) {
        console.log('[useFileUpload] Calling onError callback');
        options.onError(errorMessage);
      }

      throw error;
    }
  };

  const deleteFile = async (key: string) => {
    try {
      // Use Server Action instead of API route
      const result = await deleteFileAction(key);

      if (!result.success) {
        throw new Error(result.error || "Delete failed");
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
