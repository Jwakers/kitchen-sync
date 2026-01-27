"use client";

import { validateImageFile } from "@/app/constants";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  isHeicFile,
  processImageFile,
} from "@/lib/utils/heic-conversion";

export interface UseImageUploadOptions {
  /** Callback when upload completes successfully */
  onUploadComplete?: (storageId: Id<"_storage">) => void;
  /** Callback when upload fails */
  onUploadError?: (error: Error) => void;
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
}

export interface UseImageUploadReturn {
  /** Currently selected file */
  selectedFile: File | null;
  /** Preview URL for the selected file */
  previewUrl: string | null;
  /** Whether upload is in progress */
  isUploading: boolean;
  /** Upload the selected file to Convex storage */
  upload: () => Promise<Id<"_storage"> | null>;
  /** Handle file selection (validates and creates preview). Returns the processed file (converted from HEIC if needed) or null on failure */
  handleFileSelect: (file: File | null) => Promise<File | null>;
  /** Clear selected file and preview */
  clear: () => void;
  /** Set the preview URL directly (for existing images) */
  setPreviewUrl: (url: string | null) => void;
}

/**
 * Shared hook for image upload functionality
 * Handles validation, preview, and upload to Convex storage
 */
export function useImageUpload(
  options: UseImageUploadOptions = {}
): UseImageUploadReturn {
  const {
    onUploadComplete,
    onUploadError,
    timeout = 30000,
  } = options;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrlState] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const previewUrlRef = useRef<string | null>(null);

  const generateUploadUrl = useMutation(api.recipes.generateUploadUrl);

  // Clean up preview URLs
  const revokePreviewUrl = useCallback((url: string | null) => {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        revokePreviewUrl(previewUrlRef.current);
      }
    };
  }, [revokePreviewUrl]);

  const setPreviewUrl = useCallback(
    (url: string | null) => {
      // Revoke old preview URL
      if (previewUrlRef.current) {
        revokePreviewUrl(previewUrlRef.current);
      }
      previewUrlRef.current = url;
      setPreviewUrlState(url);
    },
    [revokePreviewUrl]
  );

  const handleFileSelect = useCallback(
    async (file: File | null): Promise<File | null> => {
      if (!file) {
        return null;
      }

      // Process HEIC/HEIF files first
      let processedFile = file;
      if (isHeicFile(file)) {
        try {
          const conversionPromise = processImageFile(file);
          
          toast.promise(conversionPromise, {
            loading: `Converting ${file.name}...`,
            success: "HEIC image converted to JPEG",
            error: (error) =>
              error instanceof Error
                ? error.message
                : "Failed to convert HEIC image. Please try a different format.",
          });

          processedFile = await conversionPromise;
        } catch (error) {
          // Error already handled by toast.promise
          console.error("HEIC conversion failed:", error);
          return null;
        }
      }

      // Validate file (after conversion if needed)
      const validation = validateImageFile(processedFile);
      if (!validation.valid) {
        toast.error(validation.error || "Invalid file", {
          description: validation.error,
        });
        return null;
      }

      // Create preview URL
      const url = URL.createObjectURL(processedFile);
      setSelectedFile(processedFile);
      setPreviewUrl(url);

      return processedFile;
    },
    [setPreviewUrl]
  );

  const upload = useCallback(async (): Promise<Id<"_storage"> | null> => {
    if (!selectedFile) {
      toast.error("Please select an image");
      return null;
    }

    setIsUploading(true);

    try {
      // Get upload URL
      const postUrl = await generateUploadUrl();

      // Upload with timeout
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), timeout);
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
        signal: ac.signal,
      }).finally(() => clearTimeout(t));

      if (!result.ok) {
        throw new Error("Failed to upload image");
      }

      const { storageId } = await result.json();

      toast.success("Image uploaded successfully");

      onUploadComplete?.(storageId);

      return storageId;
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Upload failed");
      console.error("Image upload error:", err);

      toast.error("Failed to upload image", {
        description: "Please try again",
      });

      onUploadError?.(err);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [
    selectedFile,
    generateUploadUrl,
    timeout,
    onUploadComplete,
    onUploadError,
  ]);

  const clear = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
  }, [setPreviewUrl]);

  return {
    selectedFile,
    previewUrl,
    isUploading,
    upload,
    handleFileSelect,
    clear,
    setPreviewUrl,
  };
}
