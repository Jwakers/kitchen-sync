"use client";

import { ImageUploadButton } from "@/components/image-upload";
import { useImageUpload } from "@/lib/hooks/use-image-upload";
import { Label } from "@/components/ui/label";
import { useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { type RecipeEditFormData } from "@/lib/schemas/recipe";

interface MethodStepImageUploadProps {
  form: UseFormReturn<RecipeEditFormData>;
  stepIndex: number;
  existingImageUrl?: string;
}

/**
 * Image upload component for a single method step
 * Uploads immediately when a file is selected
 */
export function MethodStepImageUpload({
  form,
  stepIndex,
  existingImageUrl,
}: MethodStepImageUploadProps) {
  const imageUpload = useImageUpload({
    onUploadComplete: (storageId) => {
      form.setValue(`method.${stepIndex}.image`, storageId);
    },
    showToasts: true,
  });

  // Get current form value for this step (storage ID)
  const formImageValue = form.watch(`method.${stepIndex}.image`);
  const hasExistingImage = !!formImageValue || !!existingImageUrl;

  // Set existing image as preview if available
  // Show existingImageUrl when we have it and no new file is selected
  useEffect(() => {
    if (existingImageUrl && !imageUpload.selectedFile && !imageUpload.previewUrl) {
      imageUpload.setPreviewUrl(existingImageUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingImageUrl]);

  // Track if we're currently processing an upload to prevent duplicate calls
  const isProcessingRef = useRef(false);

  // Auto-upload when file is selected (only if not already uploading)
  useEffect(() => {
    if (
      imageUpload.selectedFile &&
      !imageUpload.isUploading &&
      !isProcessingRef.current
    ) {
      isProcessingRef.current = true;
      
      imageUpload
        .upload()
        .catch((error) => {
          console.error("Method step image upload failed:", error);
        })
        .finally(() => {
          isProcessingRef.current = false;
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUpload.selectedFile]);

  const handleRemove = () => {
    form.setValue(`method.${stepIndex}.image`, undefined);
    imageUpload.clear();
  };

  return (
    <div>
      <Label className="text-xs mb-2 block">
        Step Image (optional)
        {hasExistingImage && (
          <span className="text-muted-foreground ml-2 text-xs font-normal">
            (Uploading a new image will replace the existing one)
          </span>
        )}
      </Label>
      <ImageUploadButton
        upload={imageUpload}
        inputId={`method.${stepIndex}.image`}
        label="Click to upload image"
        showPreview={true}
        aspectRatio="aspect-video"
        size="md"
        onRemove={handleRemove}
      />
    </div>
  );
}
