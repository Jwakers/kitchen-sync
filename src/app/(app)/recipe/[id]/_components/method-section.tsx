"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { ImageIcon, Plus, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { Recipe } from "./recipe-client";
import { RecipeEditFormData } from "./schema";

interface MethodSectionProps {
  recipe: Recipe;
  isEditMode: boolean;
  form?: UseFormReturn<RecipeEditFormData>;
}

export function MethodSection({
  recipe,
  isEditMode,
  form,
}: MethodSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form?.control,
    name: "method",
  });

  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [imagePreviews, setImagePreviews] = useState<
    Record<number, string | null>
  >({});

  const generateUploadUrl = useMutation(api.recipes.generateUploadUrl);

  // Initialize image previews from existing recipe data
  useEffect(() => {
    if (recipe?.method && isEditMode) {
      const previews: Record<number, string | null> = {};
      recipe.method.forEach((step, index) => {
        if (step.imageUrl) {
          previews[index] = step.imageUrl;
        }
      });
      setImagePreviews(previews);
    }
  }, [recipe, isEditMode]);

  const handleImageSelect = async (index: number, file: File | null) => {
    if (!file || !form) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploadingIndex(index);

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreviews((prev) => ({ ...prev, [index]: previewUrl }));

      // Upload to Convex
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Failed to upload image");
      }

      const { storageId } = await result.json();

      // Update form with storage ID
      form.setValue(`method.${index}.image`, storageId);

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image");
      // Remove preview on error
      setImagePreviews((prev) => {
        const newPreviews = { ...prev };
        delete newPreviews[index];
        return newPreviews;
      });
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (!form) return;

    form.setValue(`method.${index}.image`, undefined);
    setImagePreviews((prev) => {
      const newPreviews = { ...prev };
      if (newPreviews[index] && newPreviews[index]?.startsWith("blob:")) {
        URL.revokeObjectURL(newPreviews[index]!);
      }
      delete newPreviews[index];
      return newPreviews;
    });
    toast.success("Image removed");
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(imagePreviews).forEach((url) => {
        if (url?.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreviews]);

  if (isEditMode && form) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Method</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ title: "", description: "", image: undefined })
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {fields.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground text-sm">
                No steps yet. Click &quot;Add Step&quot; to add one.
              </p>
            ) : (
              fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-3 items-start p-4 border rounded-lg"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label
                        htmlFor={`method.${index}.title`}
                        className="text-xs"
                      >
                        Step Title
                      </Label>
                      <Input
                        id={`method.${index}.title`}
                        {...form.register(`method.${index}.title`)}
                        placeholder="e.g., Prepare the vegetables"
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor={`method.${index}.description`}
                        className="text-xs"
                      >
                        Description (optional)
                      </Label>
                      <Textarea
                        id={`method.${index}.description`}
                        {...form.register(`method.${index}.description`)}
                        placeholder="Add detailed instructions..."
                        className="min-h-[60px] resize-none"
                      />
                    </div>
                    {/* Image Upload Section */}
                    <div>
                      <Label className="text-xs mb-2 block">
                        Step Image (optional)
                      </Label>
                      {imagePreviews[index] ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                          <Image
                            src={imagePreviews[index]!}
                            alt={`Step ${index + 1} preview`}
                            fill
                            className="object-cover"
                            unoptimized
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="relative">
                          <Input
                            id={`method.${index}.image`}
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleImageSelect(
                                index,
                                e.target.files?.[0] || null
                              )
                            }
                            disabled={uploadingIndex === index}
                            className="hidden"
                          />
                          <Label
                            htmlFor={`method.${index}.image`}
                            className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
                          >
                            {uploadingIndex === index ? (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Upload className="h-5 w-5 animate-pulse" />
                                <span className="text-sm">Uploading...</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <ImageIcon className="h-5 w-5" />
                                <span className="text-sm">
                                  Click to upload image
                                </span>
                              </div>
                            )}
                          </Label>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="h-8 w-8 p-0 mt-5"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recipe?.method || recipe.method.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>method</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No method added yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Method</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-6">
          {recipe.method.map((step, index) => (
            <li key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 pt-1 space-y-3">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{step.title}</p>
                  {step.description && (
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                </div>
                {step.imageUrl && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                    <Image
                      src={step.imageUrl}
                      alt={`Step ${index + 1}: ${step.title}`}
                      fill
                      className="object-cover"
                      unoptimized
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
