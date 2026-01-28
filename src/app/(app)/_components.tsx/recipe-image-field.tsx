"use client";

import { ImageUploadArea } from "@/components/image-upload";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useImageUpload } from "@/lib/hooks/use-image-upload";
import { type RecipeCreateFormData } from "@/lib/schemas/recipe";
import { useEffect, useId } from "react";
import { ControllerRenderProps } from "react-hook-form";

interface RecipeImageFieldProps {
  field: ControllerRenderProps<RecipeCreateFormData, "image">;
  upload: ReturnType<typeof useImageUpload>;
}

/**
 * Image upload field component for recipe form
 * Handles syncing between form field and upload hook
 */
export function RecipeImageField({ field, upload }: RecipeImageFieldProps) {
  // Generate unique ID for this field instance
  const uniqueId = useId();
  const inputId = `${field.name}-image-input-${uniqueId}`;

  // Sync hook preview with form value
  useEffect(() => {
    const currentFile = field.value instanceof File ? field.value : null;
    if (currentFile && upload.selectedFile !== currentFile) {
      void upload.handleFileSelect(currentFile).then((processed) => {
        if (processed) {
          field.onChange(processed);
        }
      });
    } else if (!currentFile && upload.selectedFile) {
      upload.clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.value]);

  return (
    <FormItem>
      <FormLabel>Recipe Image (Optional)</FormLabel>
      <FormControl>
        <ImageUploadArea
          upload={upload}
          inputId={inputId}
          label="Click to upload image"
          aspectRatio="aspect-[16/9]"
          onFileSelect={(file) => {
            field.onChange(file);
          }}
          onRemove={() => {
            field.onChange(undefined);
            upload.clear();
          }}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
