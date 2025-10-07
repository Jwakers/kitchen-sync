"use client";

import { PreparationSelector } from "@/components/preparation-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UnitSelector } from "@/components/unit-selector";
import { recipeSchema, type RecipeFormData } from "@/lib/schemas/recipe";
import { titleCase } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { RECIPE_CATEGORIES } from "convex/lib/constants";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ImageIcon,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { FieldErrors, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

type RecipeFormProps = {
  closeDrawer: () => void;
};

type FormStep = "basic" | "ingredients" | "method" | "review";

export function RecipeForm({ closeDrawer }: RecipeFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>("basic");
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");
  const [recipeId, setRecipeId] = useState<Id<"recipes"> | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const creatingRecipe = useRef(false);

  const createDraftRecipeMutation = useMutation(api.recipes.createDraftRecipe);
  const updateRecipeMutation = useMutation(api.recipes.updateRecipe);
  const publishRecipeMutation = useMutation(api.recipes.publishRecipe);
  const generateUploadUrl = useMutation(api.recipes.generateUploadUrl);
  const updateRecipeImageAndDeleteOld = useMutation(
    api.recipes.updateRecipeImageAndDeleteOld
  );

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      category: "main",
      title: "",
      description: "",
      prepTime: 0,
      cookTime: undefined,
      serves: 0,
      image: undefined,
      ingredients: [],
      method: [],
    },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const {
    fields: methodFields,
    append: appendMethodStep,
    remove: removeMethodStep,
  } = useFieldArray({
    control: form.control,
    name: "method",
  });

  const steps: { key: FormStep; title: string; description: string }[] = [
    { key: "basic", title: "Basic Info", description: "Recipe details" },
    {
      key: "ingredients",
      title: "Ingredients",
      description: "Add ingredients",
    },
    { key: "method", title: "Method", description: "Cooking steps" },
    { key: "review", title: "Review", description: "Check and save" },
  ];

  const currentStepIndex = steps.findIndex((step) => step.key === currentStep);

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setSlideDirection("next");
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setSlideDirection("prev");
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const addIngredient = () => {
    appendIngredient({
      name: "",
      amount: 0,
      unit: undefined,
      preparation: undefined,
    });
  };

  const addMethodStep = () => {
    appendMethodStep({
      title: "",
      description: "",
      image: undefined,
    });
  };

  const getMethodData = useCallback(
    async (values: RecipeFormData) => {
      return await Promise.all(
        values.method.map(async (step) => {
          const image = step.image;
          if (image) {
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
              method: "POST",
              headers: { "Content-Type": image.type },
              body: image,
            });
            const { storageId } = await result.json();
            return { ...step, image: image ? storageId : undefined };
          }
          return { ...step, image: undefined };
        })
      );
    },
    [generateUploadUrl]
  );

  const onSubmit = async (values: RecipeFormData) => {
    try {
      if (!recipeId) throw new Error("Recipe ID not found");

      const method = await getMethodData(values);

      // Update recipe data
      await updateRecipeMutation({
        recipeId,
        title: values.title || undefined,
        description: values.description || undefined,
        prepTime: values.prepTime,
        cookTime: values.cookTime,
        serves: values.serves,
        category: values.category,
        ingredients: values.ingredients,
        method,
      });

      // Handle image upload only if there's a new image
      const image = values.image;
      if (image) {
        try {
          // Step 1: Get a short-lived upload URL
          const postUrl = await generateUploadUrl();

          const ac = new AbortController();
          const t = setTimeout(() => ac.abort(), 30_000);
          const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": image.type },
            body: image,
            signal: ac.signal,
          }).finally(() => clearTimeout(t));

          const { storageId } = await result.json();
          // Step 2: Save the newly allocated storage id to the database
          await updateRecipeImageAndDeleteOld({ recipeId, storageId });

          form.setValue("image", undefined);
          setImagePreviewUrl(null);

          toast.success("Image uploaded successfully");
        } catch (error) {
          const message =
            error instanceof ConvexError
              ? error.message
              : "Unexpected error. Unable to upload image";

          toast.error(message, {
            description: "Please try again",
          });
          // Don't return here - continue with publishing attempt
        }
      }

      // Try to publish the recipe
      const { errors } = await publishRecipeMutation({ recipeId });

      if (errors?.length) {
        errors.forEach((error) => {
          form.setError(error.field, { message: error.message });
        });
        toast.info("Recipe saved as draft", {
          description:
            "This recipe has been saved to your drafts as it is not fully completed",
        });
        return;
      }

      closeDrawer();
      toast.success("Recipe saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Unexpected error. Unable to save recipe", {
        description: "Please try again",
      });
    }
  };

  const onError = (errors: FieldErrors<RecipeFormData>) => {
    const errorList = (
      <ul className="list-disc">
        {Object.values(errors).map((error) => (
          <li key={error.message}>{error.message}</li>
        ))}
      </ul>
    );
    toast.error("Please fix the errors in the form", {
      description: errorList,
    });
  };

  // Create a draft recipe on mount
  useEffect(() => {
    if (recipeId || creatingRecipe.current) return;
    creatingRecipe.current = true;
    // Create a draft recipe and then update as we go
    createDraftRecipeMutation()
      .then(({ recipeId, error }) => {
        if (error) {
          toast.error(error);
          closeDrawer();
          return;
        }
        setRecipeId(recipeId);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Unexpected error. Unable to create recipe", {
          description: "Please try again",
        });
        closeDrawer();
      })
      .finally(() => {
        creatingRecipe.current = false;
      });
  }, [closeDrawer, createDraftRecipeMutation, recipeId]);

  useEffect(() => {
    // Update the recipe at each step
    if (!recipeId) return;
    if (!form.formState.isDirty) return;

    const updateRecipe = async () => {
      const formValues = form.getValues();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { image, ...valuesToUpdate } = formValues;
      const methodData = await getMethodData(formValues);

      updateRecipeMutation({
        recipeId,
        ...valuesToUpdate,
        method: methodData,
      }).catch((error) => {
        console.error(error);
      });
    };
    updateRecipe();
  }, [
    createDraftRecipeMutation,
    currentStep,
    form,
    getMethodData,
    recipeId,
    updateRecipeMutation,
  ]);

  // Clean up image preview URL when component unmounts or when image changes
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const renderStepContent = () => {
    switch (currentStep) {
      case "basic":
        return (
          <Card>
            <CardContent>
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipe Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter recipe title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe your recipe"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <FormField
                    control={form.control}
                    name="prepTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prep Time (min) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="15"
                            {...field}
                            onChange={(e) => {
                              const { value } = e.target;
                              field.onChange(
                                value === "" ? undefined : Number(value)
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cookTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cook Time (min) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="30"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <FormField
                    control={form.control}
                    name="serves"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serves *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="4"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { onChange } }) => (
                      <FormItem>
                        <FormLabel>Recipe Image (Optional)</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            {/* Image Preview */}
                            {imagePreviewUrl && (
                              <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden rounded-lg group">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                <Image
                                  src={imagePreviewUrl}
                                  alt="Recipe preview"
                                  fill
                                  sizes="(max-width: 768px) 100vw, 500px"
                                  className="object-cover size-full"
                                  unoptimized
                                />
                                {/* Remove button overlay */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      // Revoke old URL if it exists
                                      if (imagePreviewUrl) {
                                        URL.revokeObjectURL(imagePreviewUrl);
                                      }
                                      onChange(undefined);
                                      setImagePreviewUrl(null);
                                    }}
                                    className="gap-2"
                                  >
                                    <X className="h-4 w-4" />
                                    Remove Image
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* File Input - Hidden when preview is shown */}
                            {!imagePreviewUrl && (
                              <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                                <label
                                  htmlFor="recipe-image-input"
                                  className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                                >
                                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                                  <span className="text-sm text-muted-foreground">
                                    Click to upload image
                                  </span>
                                  <span className="text-xs text-muted-foreground mt-1">
                                    Max 5MB
                                  </span>
                                </label>
                                <Input
                                  id="recipe-image-input"
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      // Check file size (5MB limit)
                                      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
                                      if (!file.type?.startsWith("image/")) {
                                        toast.error("Invalid file type", {
                                          description:
                                            "Please select an image file",
                                        });
                                        e.target.value = "";
                                        onChange(undefined);
                                        return;
                                      }

                                      if (file.size > maxSizeInBytes) {
                                        toast.error("Image too large", {
                                          description:
                                            "Please select an image smaller than 5MB",
                                        });
                                        e.target.value = "";
                                        onChange(undefined);
                                        return;
                                      }

                                      // Create preview URL
                                      const previewUrl =
                                        URL.createObjectURL(file);
                                      setImagePreviewUrl(previewUrl);
                                      onChange(file);
                                    }
                                  }}
                                />
                              </div>
                            )}

                            {/* Show "Change Image" button when there's a preview */}
                            {imagePreviewUrl && (
                              <label
                                htmlFor="recipe-image-change-input"
                                className="inline-flex"
                              >
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                  asChild
                                >
                                  <span>
                                    <ImageIcon className="h-4 w-4" />
                                    Change Image
                                  </span>
                                </Button>
                                <Input
                                  id="recipe-image-change-input"
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      // Check file size (5MB limit)
                                      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
                                      if (!file.type?.startsWith("image/")) {
                                        toast.error("Invalid file type", {
                                          description:
                                            "Please select an image file",
                                        });
                                        e.target.value = "";
                                        onChange(undefined);
                                        return;
                                      }

                                      if (file.size > maxSizeInBytes) {
                                        toast.error("Image too large", {
                                          description:
                                            "Please select an image smaller than 5MB",
                                        });
                                        e.target.value = "";
                                        onChange(undefined);
                                        return;
                                      }

                                      // Revoke old preview URL if it exists
                                      if (imagePreviewUrl) {
                                        URL.revokeObjectURL(imagePreviewUrl);
                                      }

                                      // Create new preview URL
                                      const previewUrl =
                                        URL.createObjectURL(file);
                                      setImagePreviewUrl(previewUrl);
                                      onChange(file);
                                    }
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Select
                            {...field}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {RECIPE_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {titleCase(category)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        );

      case "ingredients":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Ingredients</h3>
            </div>

            <div className="space-y-3">
              {ingredientFields.map((ingredient, index) => (
                <motion.div
                  key={ingredient.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                  layout
                >
                  <Card className="p-4">
                    <div className="flex items-start gap-2">
                      <motion.span
                        className="text-sm text-muted-foreground mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {index + 1}.
                      </motion.span>
                      <div className="flex-1 space-y-2">
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <FormField
                            control={form.control}
                            name={`ingredients.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Ingredient name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        <motion.div
                          className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <FormField
                            control={form.control}
                            name={`ingredients.${index}.amount`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Amount"
                                    {...field}
                                    onChange={(e) => {
                                      const v = Number(e.target.value);
                                      field.onChange(v);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`ingredients.${index}.unit`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <UnitSelector
                                    value={field.value || ""}
                                    onValueChange={field.onChange}
                                    placeholder="Unit"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`ingredients.${index}.preparation`}
                            render={({ field }) => (
                              <FormItem className="col-span-2 sm:col-span-1">
                                <FormControl>
                                  <PreparationSelector
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Preparation"
                                    searchPlaceholder="Search preparation..."
                                    emptyText="No preparation found."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeIngredient(index)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {ingredientFields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No ingredients added yet.</p>
                  <p className="text-sm">
                    Click the card below to add your first ingredient.
                  </p>
                </div>
              )}

              {/* Add Ingredient Card */}
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer"
                onClick={addIngredient}
              >
                <Card className="p-6 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Plus className="h-5 w-5" />
                    <span className="font-medium">Add Ingredient</span>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        );

      case "method":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Cooking Method</h3>
            </div>

            <div className="space-y-3">
              {methodFields.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                  layout
                >
                  <Card className="p-4">
                    <div className="flex items-start gap-2">
                      <motion.span
                        className="text-sm text-muted-foreground mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {index + 1}.
                      </motion.span>
                      <motion.div
                        className="flex-1 space-y-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <FormField
                          control={form.control}
                          name={`method.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Title..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`method.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Describe this step..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <FormField
                            control={form.control}
                            name={`method.${index}.image`}
                            render={({ field: { onChange } }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        // Check file size (5MB limit)
                                        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
                                        if (!file.type?.startsWith("image/")) {
                                          toast.error("Invalid file type", {
                                            description:
                                              "Please select an image file",
                                          });
                                          e.target.value = "";
                                          onChange(undefined);

                                          return;
                                        }
                                        if (file.size > maxSizeInBytes) {
                                          toast.error("Image too large", {
                                            description:
                                              "Please select an image smaller than 5MB",
                                          });
                                          e.target.value = ""; // Reset the input
                                          onChange(undefined);

                                          return;
                                        }
                                        onChange(file);
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMethodStep(index)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {methodFields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No steps added yet.</p>
                  <p className="text-sm">
                    Click the card below to add your first step.
                  </p>
                </div>
              )}

              {/* Add Method Step Card */}
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer"
                onClick={addMethodStep}
              >
                <Card className="p-6 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Plus className="h-5 w-5" />
                    <span className="font-medium">Add Step</span>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        );

      case "review": {
        const formValues = form.getValues();
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Review Your Recipe</h3>

              <Card className="p-4 space-y-4">
                <div>
                  <h4 className="font-semibold text-xl">
                    {formValues.title || "Untitled Recipe"}
                  </h4>
                  {formValues.description && (
                    <p className="text-muted-foreground mt-1">
                      {formValues.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Prep:</span>{" "}
                    {formValues.prepTime} min
                  </div>
                  {formValues.cookTime ? (
                    <div>
                      <span className="text-muted-foreground">Cook:</span>{" "}
                      {formValues.cookTime} min
                    </div>
                  ) : null}
                  <div>
                    <span className="text-muted-foreground">Serves:</span>{" "}
                    {formValues.serves}
                  </div>
                </div>

                {formValues.ingredients.length > 0 && (
                  <div>
                    <h5 className="font-semibold mb-2">
                      Ingredients ({formValues.ingredients.length})
                    </h5>
                    <ul className="space-y-1 text-sm">
                      {formValues.ingredients.map((ing, index) => (
                        <li key={ing.name}>
                          {index + 1}. {ing.name}{" "}
                          {ing.amount &&
                            ing.unit &&
                            `(${ing.amount} ${ing.unit})`}
                          {ing.preparation && ` - ${ing.preparation}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {formValues.method.length > 0 && (
                  <div>
                    <h5 className="font-semibold mb-2">
                      Method ({formValues.method.length} steps)
                    </h5>
                    <ol className="space-y-1 text-sm">
                      {formValues.method.map((step, index) => (
                        <li key={step.title}>
                          {index + 1}. {step.title}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </Card>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="h-full flex flex-col overflow-auto overflow-x-hidden"
      >
        {/* Step content */}
        <div className="flex-1 p-4">
          <AnimatePresence mode="popLayout" custom={slideDirection}>
            <motion.div
              key={currentStep}
              custom={slideDirection}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={{
                initial: (direction: "next" | "prev") => ({
                  x: direction === "next" ? 300 : -300,
                  opacity: 0,
                  scale: 0.95,
                }),
                animate: {
                  x: 0,
                  opacity: 1,
                  scale: 1,
                },
                exit: (direction: "next" | "prev") => ({
                  x: direction === "next" ? -300 : 300,
                  opacity: 0,
                  scale: 0.95,
                }),
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                mass: 0.6,
              }}
              className="h-full"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="sticky bottom-0 from-background/20 to-background bg-linear-to-b backdrop-blur-sm">
          {/* Progress indicator */}
          <div className="px-4 py-3 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <span>{steps[currentStepIndex].title}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Individual step indicators with individual progress */}
              {steps.map((_, index) => (
                <div
                  key={index}
                  className="relative h-2 flex-grow overflow-hidden rounded"
                >
                  {/* Background for each section */}
                  <div className="absolute inset-0 bg-secondary" />
                  {/* Progress fill for completed sections - always rendered for smooth animation */}
                  <motion.div
                    className="absolute inset-0 bg-primary"
                    initial={{ width: "0%" }}
                    animate={{
                      width: index <= currentStepIndex ? "100%" : "0%",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 25,
                      duration: 0.6,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              {currentStepIndex > 0 ? (
                <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
                  <Button
                    type="button"
                    onClick={prevStep}
                    variant="outline"
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                </motion.div>
              ) : (
                <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
                  <Button
                    type="button"
                    onClick={closeDrawer}
                    variant="outline"
                    className="w-full"
                  >
                    Close
                  </Button>
                </motion.div>
              )}

              {currentStepIndex < steps.length - 1 ? (
                <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
                  <Button type="button" onClick={nextStep} className="w-full">
                    Next
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Recipe"
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
