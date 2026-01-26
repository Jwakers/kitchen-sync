"use client";

import { validateImageFile } from "@/app/constants";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export interface UseImageUploadOptions {
  /** Callback when upload completes successfully */
  onUploadComplete?: (storageId: Id<"_storage">) => void;
  /** Callback when upload fails */
  onUploadError?: (error: Error) => void;
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Whether to show toast notifications (default: true) */
  showToasts?: boolean;
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
  /** Handle file selection (validates and creates preview) */
  handleFileSelect: (file: File | null) => boolean;
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
    showToasts = true,
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
    (file: File | null): boolean => {
      if (!file) {
        return false;
      }

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        if (showToasts) {
          toast.error(validation.error || "Invalid file", {
            description: validation.error,
          });
        }
        return false;
      }

      // Create preview URL
      const url = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreviewUrl(url);

      return true;
    },
    [setPreviewUrl, showToasts]
  );

  const upload = useCallback(async (): Promise<Id<"_storage"> | null> => {
    if (!selectedFile) {
      if (showToasts) {
        toast.error("Please select an image");
      }
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

      if (showToasts) {
        toast.success("Image uploaded successfully");
      }

      onUploadComplete?.(storageId);

      return storageId;
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Upload failed");
      console.error("Image upload error:", err);

      if (showToasts) {
        toast.error("Failed to upload image", {
          description: "Please try again",
        });
      }

      onUploadError?.(err);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [
    selectedFile,
    generateUploadUrl,
    timeout,
    showToasts,
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
